import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { EmailService } from "./services/emailService";
import { PDFService } from "./services/pdfService";
import { ImageService } from "./services/imageService";
import { calculateQuote, validatePhotos } from "./services/quoteCalculator";
import { quoteRateLimiter, generalRateLimiter } from "./middleware/rateLimiter";
import { requireOwnerPin, createOwnerSession, requireOwnerSession } from "./middleware/ownerAuth";
import { insertQuoteSchema, insertSettingsSchema, insertTestimonialSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const imageService = new ImageService();
  const upload = imageService.createMulterUpload();

  // Serve uploaded images
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Apply rate limiting
  app.use('/api/quote', quoteRateLimiter.middleware());
  app.use('/api', generalRateLimiter.middleware());

  // Honeypot middleware for spam protection
  app.use('/api/quote', (req, res, next) => {
    if (req.body.website || req.body.url || req.body.honeypot) {
      return res.status(400).json({ message: "Invalid request" });
    }
    next();
  });

  // Quote submission (customer)
  app.post('/api/quote', upload.array('photos', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[] || [];
      
      // Validate request data
      const validationResult = insertQuoteSchema.safeParse({
        ...req.body,
        items: JSON.parse(req.body.items || '[]'),
        photosRepresentativeConfirmed: req.body.photosRepresentativeConfirmed === 'true',
        provisionalEstimateConfirmed: req.body.provisionalEstimateConfirmed === 'true'
      });

      if (!validationResult.success) {
        // Clean up uploaded files
        for (const file of files) {
          await imageService.deleteImage(file.filename);
        }
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const quoteData = validationResult.data;

      // Validate photos
      const photoValidation = validatePhotos(files.length);
      
      // Validate each uploaded image
      const photoFilenames: string[] = [];
      const validationErrors: string[] = [];

      for (const file of files) {
        const validation = await imageService.validateImage(file.path);
        if (validation.isValid) {
          photoFilenames.push(file.filename);
        } else {
          validationErrors.push(...validation.errors);
          await imageService.deleteImage(file.filename);
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "Photo validation failed",
          errors: validationErrors
        });
      }

      // Get current settings for calculation
      const settings = await storage.getSettings();
      const rates = {
        labourRate: settings.labourRate,
        materialsPerPanel: settings.materialsPerPanel,
        partsMarkup: settings.partsMarkup,
        metallicMultiplier: settings.metallicMultiplier,
        pearlescentMultiplier: settings.pearlescentMultiplier,
        minJob: settings.minJob
      };

      // Calculate quote
      const calculation = calculateQuote(
        quoteData.items,
        quoteData.vehiclePaint,
        rates,
        photoValidation.isValid
      );

      // Create quote
      const quote = await storage.createQuote({
        ...quoteData,
        ratesJson: JSON.stringify(rates),
        calcJson: JSON.stringify(calculation),
        photos: photoFilenames
      });

      // Send confirmation email
      const emailService = new EmailService(settings);
      if (emailService.isConfigured()) {
        await emailService.sendQuoteSubmissionConfirmation(
          quote.customerEmail,
          quote.customerName,
          quote.id
        );
      }

      res.status(201).json({
        message: "Quote submitted successfully",
        quoteId: quote.id,
        status: quote.status,
        photoValidation: photoValidation,
        emailSent: emailService.isConfigured()
      });

    } catch (error) {
      console.error('Quote submission error:', error);
      res.status(500).json({ message: "Failed to submit quote" });
    }
  });

  // Get quote (owner only)
  app.get('/api/quote/:id', requireOwnerSession, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const statusHistory = await storage.getQuoteStatusHistory(quote.id);
      
      res.json({
        ...quote,
        items: JSON.parse(quote.itemsJson),
        rates: JSON.parse(quote.ratesJson),
        calculation: JSON.parse(quote.calcJson),
        photos: quote.photosJson ? JSON.parse(quote.photosJson) : [],
        statusHistory
      });
    } catch (error) {
      console.error('Get quote error:', error);
      res.status(500).json({ message: "Failed to get quote" });
    }
  });

  // Update quote (owner only)
  app.patch('/api/quote/:id', requireOwnerSession, async (req, res) => {
    try {
      const { items, rates, ownerNotes } = req.body;
      
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      let updates: any = {};

      if (ownerNotes !== undefined) {
        updates.ownerNotes = ownerNotes;
      }

      if (items && rates) {
        // Recalculate with new items/rates
        const calculation = calculateQuote(
          items,
          quote.vehiclePaint,
          rates,
          true // Assume photos are valid for owner updates
        );

        updates.itemsJson = JSON.stringify(items);
        updates.ratesJson = JSON.stringify(rates);
        updates.calcJson = JSON.stringify(calculation);
      }

      const updatedQuote = await storage.updateQuote(req.params.id, updates);
      res.json(updatedQuote);

    } catch (error) {
      console.error('Update quote error:', error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  // Approve quote (owner only)
  app.post('/api/quote/:id/approve', requireOwnerSession, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (quote.status !== 'new') {
        return res.status(400).json({ message: "Quote already processed" });
      }

      // Update status to approved
      const updatedQuote = await storage.updateQuote(req.params.id, { status: 'approved' });
      await storage.addQuoteStatusHistory(req.params.id, 'approved', 'Quote approved by owner');

      // Generate PDF and send email
      const settings = await storage.getSettings();
      const emailService = new EmailService(settings);
      const calculation = JSON.parse(quote.calcJson);

      const quoteUrl = `${settings.siteUrl}/q/${quote.customerLinkSlug}`;
      const pdfUrl = `${settings.siteUrl}/api/quote/${quote.id}/pdf`;

      if (emailService.isConfigured()) {
        const emailResult = await emailService.sendApprovedQuote(
          quote.customerEmail,
          quote.customerName,
          quoteUrl,
          pdfUrl,
          calculation.totalIncGST
        );

        if (emailResult.success) {
          await storage.updateQuote(req.params.id, { status: 'sent' });
          await storage.addQuoteStatusHistory(req.params.id, 'sent', 'Quote sent to customer');
        }
      }

      res.json({
        message: "Quote approved successfully",
        quote: updatedQuote,
        quoteUrl,
        pdfUrl,
        emailSent: emailService.isConfigured()
      });

    } catch (error) {
      console.error('Approve quote error:', error);
      res.status(500).json({ message: "Failed to approve quote" });
    }
  });

  // Get all quotes (owner only)
  app.get('/api/quotes', requireOwnerSession, async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      
      const quotesWithCalculations = quotes.map(quote => ({
        ...quote,
        calculation: JSON.parse(quote.calcJson),
        items: JSON.parse(quote.itemsJson)
      }));

      res.json(quotesWithCalculations);
    } catch (error) {
      console.error('Get quotes error:', error);
      res.status(500).json({ message: "Failed to get quotes" });
    }
  });

  // Delete quote (owner only)
  app.delete('/api/quote/:id', requireOwnerSession, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      // Delete associated photos
      if (quote.photosJson) {
        const photos = JSON.parse(quote.photosJson);
        for (const photo of photos) {
          await imageService.deleteImage(photo);
        }
      }

      const deleted = await storage.deleteQuote(req.params.id);
      if (deleted) {
        res.json({ message: "Quote deleted successfully" });
      } else {
        res.status(404).json({ message: "Quote not found" });
      }
    } catch (error) {
      console.error('Delete quote error:', error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Generate PDF (owner and public for approved quotes)
  app.get('/api/quote/:id/pdf', async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      // Check if quote is approved for public access
      if (quote.status !== 'approved' && quote.status !== 'sent') {
        if (!req.session?.isOwner) {
          return res.status(403).json({ message: "Quote not available" });
        }
      }

      const settings = await storage.getSettings();
      const pdfService = new PDFService(settings);
      
      const pdfBuffer = await pdfService.generatePDF(quote);
      const filename = pdfService.getQuoteFileName(quote);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Public quote view
  app.get('/q/:slug', async (req, res) => {
    try {
      const quote = await storage.getQuoteBySlug(req.params.slug);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (quote.status !== 'approved' && quote.status !== 'sent') {
        return res.status(403).json({ message: "Quote not available" });
      }

      res.json({
        ...quote,
        items: JSON.parse(quote.itemsJson),
        calculation: JSON.parse(quote.calcJson),
        photos: quote.photosJson ? JSON.parse(quote.photosJson) : []
      });
    } catch (error) {
      console.error('Public quote error:', error);
      res.status(500).json({ message: "Failed to get quote" });
    }
  });

  // Owner authentication
  app.post('/api/owner/login', async (req, res) => {
    try {
      const { pin } = req.body;
      const settings = await storage.getSettings();
      
      if (pin === settings.ownerPin) {
        if (req.session) {
          req.session.isOwner = true;
        }
        res.json({ message: "Authentication successful" });
      } else {
        res.status(401).json({ message: "Invalid PIN" });
      }
    } catch (error) {
      console.error('Owner login error:', error);
      res.status(500).json({ message: "Authentication error" });
    }
  });

  app.post('/api/owner/logout', (req, res) => {
    if (req.session) {
      req.session.isOwner = false;
    }
    res.json({ message: "Logged out successfully" });
  });

  // Settings management (owner only)
  app.get('/api/settings', requireOwnerSession, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      // Don't expose sensitive data in response
      const { ownerPin, sendgridApiKey, ...publicSettings } = settings;
      res.json(publicSettings);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.patch('/api/settings', requireOwnerSession, async (req, res) => {
    try {
      const validationResult = insertSettingsSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const updatedSettings = await storage.updateSettings(validationResult.data);
      const { ownerPin, sendgridApiKey, ...publicSettings } = updatedSettings;
      
      res.json(publicSettings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Change owner PIN (requires current PIN)
  app.post('/api/owner/change-pin', async (req, res) => {
    try {
      const { currentPin, newPin } = req.body;
      
      if (!currentPin || !newPin) {
        return res.status(400).json({ message: "Current PIN and new PIN required" });
      }

      if (newPin.length < 4 || newPin.length > 6) {
        return res.status(400).json({ message: "PIN must be 4-6 digits" });
      }

      const settings = await storage.getSettings();
      
      if (currentPin !== settings.ownerPin) {
        return res.status(401).json({ message: "Invalid current PIN" });
      }

      await storage.updateSettings({ ownerPin: newPin });
      res.json({ message: "PIN changed successfully" });

    } catch (error) {
      console.error('Change PIN error:', error);
      res.status(500).json({ message: "Failed to change PIN" });
    }
  });

  // Analytics (owner only)
  app.get('/api/analytics', requireOwnerSession, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Testimonials
  app.post('/api/testimonial', async (req, res) => {
    try {
      const validationResult = insertTestimonialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const testimonial = await storage.createTestimonial(validationResult.data);
      res.status(201).json(testimonial);

    } catch (error) {
      console.error('Testimonial error:', error);
      res.status(500).json({ message: "Failed to submit testimonial" });
    }
  });

  app.get('/api/testimonials', requireOwnerSession, async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error('Get testimonials error:', error);
      res.status(500).json({ message: "Failed to get testimonials" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
