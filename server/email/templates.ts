/**
 * Email templates for SendGrid
 * Professional, branded email templates for various use cases
 */

export interface ContactFormEmailData {
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

/**
 * Contact form submission email template
 * Sent to business owner when a contact form is submitted
 */
export function generateContactFormEmail(data: ContactFormEmailData): { html: string; text: string } {
  const { name, email, message, timestamp } = data;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: #1a1a1a; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Contact Form Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone wants to connect with you</p>
      </div>
      
      <div style="padding: 30px 20px; background-color: #ffffff;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #D4AF37;">
          <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 20px;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: 600; color: #555; width: 120px;">Name:</td>
              <td style="padding: 12px 0; color: #1a1a1a;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: 600; color: #555;">Email:</td>
              <td style="padding: 12px 0; color: #1a1a1a;"><a href="mailto:${email}" style="color: #D4AF37; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #555;">Received:</td>
              <td style="padding: 12px 0; color: #1a1a1a;">${new Date(timestamp).toLocaleString('en-AU', { 
                timeZone: 'Australia/Melbourne',
                dateStyle: 'medium',
                timeStyle: 'short'
              })}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 18px;">Message:</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.6; color: #1a1a1a; white-space: pre-wrap; border: 1px solid #e0e0e0;">${message}</div>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 16px; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #1a1a1a; font-size: 14px;">
            <strong>Action Required:</strong> Please respond to this inquiry within 24 hours to maintain excellent customer service standards.
          </p>
        </div>
        
        <div style="margin-top: 24px; text-align: center;">
          <a href="mailto:${email}" style="display: inline-block; background-color: #D4AF37; color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reply to ${name}</a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #666; font-size: 13px;">This is an automated notification from your contact form</p>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">&copy; ${new Date().getFullYear()} HwinNwin. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const text = `
NEW CONTACT FORM SUBMISSION
============================

Contact Details:
- Name: ${name}
- Email: ${email}
- Received: ${new Date(timestamp).toLocaleString('en-AU', { 
    timeZone: 'Australia/Melbourne',
    dateStyle: 'medium',
    timeStyle: 'short'
  })}

Message:
${message}

ACTION REQUIRED: Please respond to this inquiry within 24 hours to maintain excellent customer service standards.

Reply directly to: ${email}

---
This is an automated notification from your contact form
© ${new Date().getFullYear()} HwinNwin. All rights reserved.
  `;
  
  return { html, text };
}

/**
 * Contact form confirmation email template (optional)
 * Sent to the person who submitted the contact form
 */
export function generateContactConfirmationEmail(name: string): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: #1a1a1a; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Thank You for Reaching Out!</h1>
      </div>
      
      <div style="padding: 30px 20px; background-color: #ffffff;">
        <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a; margin: 0 0 16px 0;">
          Dear ${name},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a; margin: 0 0 16px 0;">
          Thank you for contacting HwinNwin. We have received your message and will get back to you within 24 hours.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #D4AF37;">
          <p style="margin: 0; color: #1a1a1a; font-size: 14px;">
            <strong>What happens next?</strong>
          </p>
          <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #1a1a1a;">
            <li style="margin-bottom: 8px;">Our team will review your inquiry</li>
            <li style="margin-bottom: 8px;">We'll respond within 24 hours (usually much sooner)</li>
            <li>You'll receive a personalized response to your specific needs</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a; margin: 0;">
          Best regards,<br>
          <strong>The HwinNwin Team</strong>
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #666; font-size: 13px;">This is an automated confirmation message</p>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">&copy; ${new Date().getFullYear()} HwinNwin. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const text = `
Thank You for Reaching Out!

Dear ${name},

Thank you for contacting HwinNwin. We have received your message and will get back to you within 24 hours.

What happens next?
- Our team will review your inquiry
- We'll respond within 24 hours (usually much sooner)
- You'll receive a personalized response to your specific needs

Best regards,
The HwinNwin Team

---
This is an automated confirmation message
© ${new Date().getFullYear()} HwinNwin. All rights reserved.
  `;
  
  return { html, text };
}
