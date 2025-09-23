import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";

import path from "path";
import { storage } from "./storage";
import { EmailService } from "./services/emailService";
import { PDFService } from "./services/pdfService";
import { ImageService } from "./services/imageService";
import { calculateQuote, validatePhotos } from "./services/quoteCalculator";
import { quoteRateLimiter, generalRateLimiter, pinChangeRateLimiter } from "./middleware/rateLimiter";
import { requireOwnerPin, createOwnerSession, requireOwnerSession } from "./middleware/ownerAuth";
import { insertQuoteSchema, insertSettingsSchema, insertTestimonialSchema, firstTimePinChangeSchema, pinChangeSchema } from "@shared/schema";
import { hashPin, comparePin, isPinHashed } from "./services/pinService";
import { z } from "zod";

// Helper function to safely parse JSON and handle 'undefined' strings
function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, 'returning default:', defaultValue);
    return defaultValue;
  }
}

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
        itemsJson: JSON.stringify(quoteData.items),
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
        items: safeJsonParse(quote.itemsJson, []),
        rates: safeJsonParse(quote.ratesJson, {}),
        calculation: safeJsonParse(quote.calcJson, null),
        photos: safeJsonParse(quote.photosJson, []),
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
      const calculation = safeJsonParse(quote.calcJson, null);

      const quoteUrl = `${settings.siteUrl}/q/${quote.customerLinkSlug}`;
      const pdfUrl = `${settings.siteUrl}/api/quote/${quote.id}/pdf`;

      if (emailService.isConfigured()) {
        const emailResult = await emailService.sendApprovedQuote(
          quote.customerEmail,
          quote.customerName,
          quoteUrl,
          pdfUrl,
          calculation?.totalIncGST || 0
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
      
      const quotesWithCalculations = quotes.map(quote => {
        return {
          ...quote,
          calculation: safeJsonParse(quote.calcJson, null),
          items: safeJsonParse(quote.itemsJson, [])
        };
      });

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

  // Generate HTML preview (owner and public for approved quotes)
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
      // Debug logging removed for security
      
      const pdfService = new PDFService(settings);
      
      const pdfBuffer = await pdfService.generatePDF(quote);
      const filename = pdfService.getQuoteFileName(quote);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('HTML generation error:', error);
      res.status(500).json({ message: "Failed to generate HTML preview" });
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

      // Only expose public-safe information, exclude sensitive owner data
      res.json({
        id: quote.id,
        status: quote.status,
        createdAt: quote.createdAt,
        customerName: quote.customerName,
        vehicleRego: quote.vehicleRego,
        vehicleMake: quote.vehicleMake,
        vehicleModel: quote.vehicleModel,
        vehicleYear: quote.vehicleYear,
        vehiclePaint: quote.vehiclePaint,
        items: JSON.parse(quote.itemsJson),
        calculation: JSON.parse(quote.calcJson),
        photos: quote.photosJson ? JSON.parse(quote.photosJson) : []
        // Explicitly exclude: ownerNotes, ratesJson, customerPhone, customerEmail for privacy
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
      
      // Use constant-time comparison to prevent timing attacks
      const isValidPin = isPinHashed(settings.ownerPin) 
        ? await comparePin(pin, settings.ownerPin)
        : pin === settings.ownerPin;
        
      if (isValidPin) {
        // Regenerate session ID to prevent session fixation attacks
        if (req.session) {
          req.session.regenerate((err) => {
            if (err) {
              console.error('Session regeneration error:', err);
              return res.status(500).json({ message: "Authentication error" });
            }
            
            // Set the isOwner flag on the new session
            req.session.isOwner = true;
            
            // Save the session
            req.session.save((saveErr) => {
              if (saveErr) {
                console.error('Session save error:', saveErr);
                return res.status(500).json({ message: "Authentication error" });
              }
              
              res.json({ message: "Authentication successful" });
            });
          });
        } else {
          res.status(500).json({ message: "Session not available" });
        }
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
      // Properly destroy the session to prevent session fixation
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: "Logout error" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid'); // Default session cookie name
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
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

  // First-time PIN change (unauthenticated, for fresh installations)
  app.post('/api/owner/first-time-pin-change', pinChangeRateLimiter.middleware(), async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      // Only allow first-time PIN change if using default PIN
      if (!settings.isDefaultPin) {
        return res.status(403).json({ 
          message: "First-time PIN change is only allowed for fresh installations with default PIN",
          requiresNormalPinChange: true 
        });
      }

      // Validate request body using strong PIN requirements
      const validationResult = firstTimePinChangeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "PIN validation failed",
          errors: validationResult.error.errors
        });
      }

      const { newPin } = validationResult.data;
      
      // Ensure new PIN is different from default PIN
      if (newPin === settings.ownerPin) {
        return res.status(400).json({ 
          message: "New PIN must be different from the default PIN" 
        });
      }

      // Hash the new PIN before storage
      const hashedPin = await hashPin(newPin);
      
      // Update PIN and mark as no longer default
      await storage.updateSettings({ 
        ownerPin: hashedPin, 
        isDefaultPin: false 
      });

      res.json({ 
        message: "PIN changed successfully. You can now access owner features.",
        success: true 
      });

    } catch (error) {
      console.error('First-time PIN change error:', error);
      res.status(500).json({ message: "Failed to change PIN" });
    }
  });

  // Change owner PIN (requires current PIN and owner session)
  app.post('/api/owner/change-pin', requireOwnerSession, pinChangeRateLimiter.middleware(), async (req, res) => {
    try {
      // Validate request body using strong PIN requirements
      const validationResult = pinChangeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "PIN validation failed",
          errors: validationResult.error.errors
        });
      }

      const { currentPin, newPin } = validationResult.data;
      const settings = await storage.getSettings();
      
      // Verify current PIN using constant-time comparison
      const isValidPin = isPinHashed(settings.ownerPin) 
        ? await comparePin(currentPin, settings.ownerPin)
        : currentPin === settings.ownerPin;
        
      if (!isValidPin) {
        return res.status(401).json({ message: "Current PIN is incorrect" });
      }

      // Hash the new PIN before storage
      const hashedPin = await hashPin(newPin);
      
      // Update PIN and ensure isDefaultPin is set to false
      await storage.updateSettings({ 
        ownerPin: hashedPin, 
        isDefaultPin: false 
      });

      res.json({ 
        message: "PIN changed successfully",
        success: true 
      });

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
