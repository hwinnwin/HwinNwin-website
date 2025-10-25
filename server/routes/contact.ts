import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { EmailService } from "../services/emailService";
import { generateContactFormEmail } from "../email/templates";
import { simpleContactFormSchema } from "@shared/schema";
import { generalRateLimiter } from "../middleware/rateLimiter";

/**
 * Contact form routes with rate limiting and spam protection
 */
export function registerContactRoutes(app: Express) {
  
  /**
   * POST /api/contact
   * Handle contact form submission
   * - Rate limited to prevent spam
   * - Honeypot field validation
   * - Email notification to owner
   * - In-memory storage for Owner Insights
   */
  app.post('/api/contact', generalRateLimiter.middleware(), async (req: Request, res: Response) => {
    try {
      // Validate request data
      const validationResult = simpleContactFormSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Please check your form and try again", 
          errors: validationResult.error.errors 
        });
      }

      const { name, email, message, consent, website } = validationResult.data;

      // Honeypot spam protection - website field should be empty
      if (website && website !== "") {
        console.log('Spam detected: honeypot field filled');
        return res.status(400).json({ 
          message: "Invalid request" 
        });
      }

      // Verify consent checkbox is checked (additional server-side validation)
      if (!consent) {
        return res.status(400).json({ 
          message: "You must agree to be contacted about your inquiry" 
        });
      }

      // Store submission in memory for Owner Insights panel
      const submission = storage.createContactSubmission({
        name,
        email,
        message,
        consent
      });

      // Get settings for email service
      const settings = await storage.getSettings();
      const emailService = new EmailService(settings);

      if (!emailService.isConfigured()) {
        console.warn('Contact form submitted but email service not configured');
        
        // Still return success to user, but log the issue
        return res.status(200).json({ 
          message: "Thank you for your message! We'll be in touch soon.",
          submissionId: submission.id
        });
      }

      // Generate email content
      const emailContent = generateContactFormEmail({
        name,
        email,
        message,
        timestamp: submission.timestamp
      });

      // Determine recipient email
      const recipientEmail = process.env.EMAIL_TO || settings.fromEmail || 'contact@hwinnwin.com';

      // Send notification email to business owner
      const emailResult = await emailService.sendEmail({
        to: recipientEmail,
        from: settings.fromEmail || 'contact@hwinnwin.com',
        subject: `New Contact Form Submission - ${name}`,
        html: emailContent.html,
        text: emailContent.text
      });

      if (!emailResult.success) {
        console.error('Failed to send contact form email:', emailResult.error);
        // Don't fail the request, submission is still stored
      }

      // Return success response
      res.status(200).json({ 
        message: "Thank you for your message! We'll get back to you within 24 hours.",
        submissionId: submission.id
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ 
        message: "Sorry, something went wrong. Please try again later." 
      });
    }
  });

  /**
   * GET /api/contact/submissions
   * Get all contact submissions (for Owner Insights panel)
   * Note: This should be protected by owner authentication in production
   */
  app.get('/api/contact/submissions', async (req: Request, res: Response) => {
    try {
      const submissions = storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      res.status(500).json({ 
        message: "Failed to fetch submissions" 
      });
    }
  });

  /**
   * PATCH /api/contact/submissions/:id
   * Update contact submission status
   * Note: This should be protected by owner authentication in production
   */
  app.patch('/api/contact/submissions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['new', 'read', 'responded'].includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status" 
        });
      }

      const updated = storage.updateContactSubmission(id, { status });

      if (!updated) {
        return res.status(404).json({ 
          message: "Submission not found" 
        });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating contact submission:', error);
      res.status(500).json({ 
        message: "Failed to update submission" 
      });
    }
  });
}
