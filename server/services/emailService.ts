import sgMail from "@sendgrid/mail";
import type { Settings } from "@shared/schema";

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private apiKey: string | null = null;
  private fromEmail: string = "quotes@leemurdokpanels.com.au";

  constructor(settings?: Settings) {
    if (settings?.sendgridApiKey) {
      this.apiKey = settings.sendgridApiKey;
      sgMail.setApiKey(this.apiKey);
    }
    if (settings?.fromEmail) {
      this.fromEmail = settings.fromEmail;
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async sendEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { 
        success: false, 
        error: "Email service not configured. SendGrid API key missing." 
      };
    }

    try {
      await sgMail.send({
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      
      return { success: true };
    } catch (error) {
      console.error('SendGrid email error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown email error" 
      };
    }
  }

  async sendQuoteSubmissionConfirmation(
    customerEmail: string, 
    customerName: string, 
    quoteId: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = "Quote Request Received - Lee Murdok Panels";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E40AF; color: white; padding: 20px; text-align: center;">
          <h1>Lee Murdok Panels</h1>
          <p>Professional Auto Damage Assessment</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Thank you for your quote request!</h2>
          
          <p>Dear ${customerName},</p>
          
          <p>We have received your vehicle damage assessment request and our team is currently reviewing the details and photos you provided.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Quote Reference:</strong> ${quoteId}</p>
            <p><strong>Status:</strong> Awaiting Owner Approval</p>
            <p><strong>Expected Response:</strong> Within 24 hours</p>
          </div>
          
          <p>You will receive another email with your detailed quote once our specialists have completed their assessment and the owner has approved the pricing.</p>
          
          <p>If you have any questions or need to provide additional information, please contact us:</p>
          
          <ul>
            <li>Phone: (03) 9123 4567</li>
            <li>Email: quotes@leemurdokpanels.com.au</li>
          </ul>
          
          <p>Thank you for choosing Lee Murdok Panels for your automotive repair needs.</p>
          
          <p>Best regards,<br>
          The Lee Murdok Panels Team</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Lee Murdok Panels. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
Thank you for your quote request!

Dear ${customerName},

We have received your vehicle damage assessment request and our team is currently reviewing the details and photos you provided.

Quote Reference: ${quoteId}
Status: Awaiting Owner Approval
Expected Response: Within 24 hours

You will receive another email with your detailed quote once our specialists have completed their assessment and the owner has approved the pricing.

If you have any questions, please contact us at (03) 9123 4567 or quotes@leemurdokpanels.com.au.

Best regards,
The Lee Murdok Panels Team
    `;

    return this.sendEmail({
      to: customerEmail,
      from: this.fromEmail,
      subject,
      text,
      html
    });
  }

  async sendApprovedQuote(
    customerEmail: string,
    customerName: string,
    quoteUrl: string,
    pdfUrl: string,
    totalAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    const subject = "Your Vehicle Damage Quote is Ready - Lee Murdok Panels";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E40AF; color: white; padding: 20px; text-align: center;">
          <h1>Lee Murdok Panels</h1>
          <p>Professional Auto Damage Assessment</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Your quote is ready!</h2>
          
          <p>Dear ${customerName},</p>
          
          <p>Great news! We have completed the assessment of your vehicle damage and your quote has been approved.</p>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0;"><strong>Total Quote Amount: AUD $${totalAmount.toFixed(2)} (inc GST)</strong></p>
          </div>
          
          <p>You can view your detailed quote and photos online:</p>
          <p><a href="${quoteUrl}" style="background-color: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Quote</a></p>
          
          <p>You can also download the PDF version:</p>
          <p><a href="${pdfUrl}" style="background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download PDF</a></p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> This is a provisional estimate based on the photos provided. Final pricing may change after physical vehicle inspection.</p>
          </div>
          
          <p>Ready to proceed? Contact us to schedule your repair:</p>
          <ul>
            <li>Phone: (03) 9123 4567</li>
            <li>Email: quotes@leemurdokpanels.com.au</li>
          </ul>
          
          <p>Thank you for choosing Lee Murdok Panels!</p>
          
          <p>Best regards,<br>
          The Lee Murdok Panels Team</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>&copy; 2024 Lee Murdok Panels. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
Your quote is ready!

Dear ${customerName},

Great news! We have completed the assessment of your vehicle damage and your quote has been approved.

Total Quote Amount: AUD $${totalAmount.toFixed(2)} (inc GST)

View your detailed quote online: ${quoteUrl}
Download PDF: ${pdfUrl}

Important: This is a provisional estimate based on the photos provided. Final pricing may change after physical vehicle inspection.

Ready to proceed? Contact us at (03) 9123 4567 or quotes@leemurdokpanels.com.au.

Best regards,
The Lee Murdok Panels Team
    `;

    return this.sendEmail({
      to: customerEmail,
      from: this.fromEmail,
      subject,
      text,
      html
    });
  }
}
