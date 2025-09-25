import type { Quote, Settings, QuoteCalculation, DamageItem } from "@shared/schema";

export class PDFService {
  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  generateQuoteHTML(quote: Quote): string {
    // Debug logging removed for security

    // Handle undefined string literals and null values with more robust checking
    let items: DamageItem[] = [];
    try {
      items = quote.itemsJson && quote.itemsJson !== 'undefined' && quote.itemsJson !== 'null' && quote.itemsJson.trim() ? JSON.parse(quote.itemsJson) : [];
    } catch (e) {
      console.error('Items JSON parse error:', e);
      items = [];
    }

    let calc: QuoteCalculation = {
      repairHrs: 0, paintHrs: 0, labour: 0, materials: 0, parts: 0,
      subtotalExGST: 0, gst: 0, totalIncGST: 0, blendPanels: 0, confidence: 'low'
    };
    try {
      calc = quote.calcJson && quote.calcJson !== 'undefined' && quote.calcJson !== 'null' && quote.calcJson.trim() ? JSON.parse(quote.calcJson) : calc;
    } catch (e) {
      console.error('Calc JSON parse error:', e);
    }

    let photos: string[] = [];
    try {
      photos = quote.photosJson && quote.photosJson !== 'undefined' && quote.photosJson !== 'null' && quote.photosJson.trim() ? JSON.parse(quote.photosJson) : [];
    } catch (e) {
      console.error('Photos JSON parse error:', e);
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vehicle Damage Quote - ${quote.id}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            background-color: ${this.settings.primaryColor};
            color: white;
            padding: 30px;
            text-align: center;
            margin: -20px -20px 30px -20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
        }
        .quote-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .info-section h3 {
            margin-top: 0;
            color: ${this.settings.primaryColor};
            border-bottom: 2px solid ${this.settings.primaryColor};
            padding-bottom: 5px;
        }
        .damage-items {
            margin: 30px 0;
        }
        .damage-item {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid ${this.settings.primaryColor};
        }
        .damage-item h4 {
            margin: 0 0 10px 0;
            color: ${this.settings.primaryColor};
        }
        .damage-details {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            font-size: 14px;
        }
        .quote-calculation {
            background-color: #e8f4f8;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .quote-calculation h3 {
            margin-top: 0;
            color: ${this.settings.primaryColor};
            text-align: center;
        }
        .calc-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .calc-row.total {
            border-top: 2px solid ${this.settings.primaryColor};
            border-bottom: 2px solid ${this.settings.primaryColor};
            font-weight: bold;
            font-size: 18px;
            margin-top: 10px;
            padding-top: 15px;
        }
        .disclaimer {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .disclaimer h4 {
            margin-top: 0;
            color: #856404;
        }
        .contact-info {
            text-align: center;
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .contact-info h4 {
            color: ${this.settings.primaryColor};
            margin-bottom: 15px;
        }
        .confidence-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .confidence-high {
            background-color: #d4edda;
            color: #155724;
        }
        .confidence-low {
            background-color: #f8d7da;
            color: #721c24;
        }
        @media print {
            body { margin: 0; }
            .header { margin: -20px -20px 20px -20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Auto Panel Repair</div>
        <div class="tagline">Professional Auto Damage Assessment</div>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
        <h2>Vehicle Damage Quote</h2>
        <p><strong>Quote ID:</strong> ${quote.id}</p>
        <p><strong>Date:</strong> ${new Date(quote.createdAt || Date.now()).toLocaleDateString('en-AU')}</p>
        <div class="confidence-badge confidence-${calc.confidence}">
            ${calc.confidence.toUpperCase()} CONFIDENCE
        </div>
    </div>

    <div class="quote-info">
        <div class="info-section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${quote.customerName}</p>
            <p><strong>Phone:</strong> ${quote.customerPhone}</p>
            <p><strong>Email:</strong> ${quote.customerEmail}</p>
        </div>
        
        <div class="info-section">
            <h3>Vehicle Details</h3>
            <p><strong>Registration:</strong> ${quote.vehicleRego}</p>
            <p><strong>Make & Model:</strong> ${quote.vehicleYear} ${quote.vehicleMake} ${quote.vehicleModel}</p>
            <p><strong>Paint Type:</strong> ${quote.vehiclePaint ? quote.vehiclePaint.charAt(0).toUpperCase() + quote.vehiclePaint.slice(1) : 'Unknown'}</p>
        </div>
    </div>

    <div class="damage-items">
        <h3>Damage Assessment</h3>
        ${items.map((item, index) => `
            <div class="damage-item">
                <h4>Item #${index + 1}: ${item.panel}</h4>
                <div class="damage-details">
                    <div><strong>Severity:</strong> ${item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}</div>
                    <div><strong>Parts Cost:</strong> AUD $${item.partsCost.toFixed(2)}</div>
                    <div><strong>Blending:</strong> ${item.blend ? 'Required' : 'Not required'}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="quote-calculation">
        <h3>Quote Breakdown</h3>
        <div class="calc-row">
            <span>Labour (${calc.repairHrs || 0} repair + ${calc.paintHrs || 0} paint hours @ AUD $${JSON.parse(quote.ratesJson || '{"labourRate": 0}').labourRate || 0}/hr):</span>
            <span>AUD $${(calc.labour || 0).toFixed(2)}</span>
        </div>
        <div class="calc-row">
            <span>Materials (${items.length} panels${(calc.blendPanels || 0) > 0 ? ` + ${calc.blendPanels} blend` : ''}):</span>
            <span>AUD $${(calc.materials || 0).toFixed(2)}</span>
        </div>
        <div class="calc-row">
            <span>Parts & Components:</span>
            <span>AUD $${(calc.parts || 0).toFixed(2)}</span>
        </div>
        <div class="calc-row">
            <span><strong>Subtotal (ex-GST):</strong></span>
            <span><strong>AUD $${(calc.subtotalExGST || 0).toFixed(2)}</strong></span>
        </div>
        <div class="calc-row">
            <span>GST (10%):</span>
            <span>AUD $${(calc.gst || 0).toFixed(2)}</span>
        </div>
        <div class="calc-row total">
            <span>TOTAL (inc-GST):</span>
            <span>AUD $${(calc.totalIncGST || 0).toFixed(2)}</span>
        </div>
    </div>

    <div class="disclaimer">
        <h4>Important Information</h4>
        <ul>
            <li><strong>Provisional Estimate:</strong> This quote is based on photos provided. Final pricing may change after physical vehicle inspection.</li>
            <li><strong>Quote Validity:</strong> This quote is valid for 30 days from the issue date.</li>
            <li><strong>Quality Guarantee:</strong> All work is covered by our comprehensive quality guarantee.</li>
            <li><strong>Insurance:</strong> We work with all major insurance companies and can assist with claims.</li>
        </ul>
    </div>

    <div class="contact-info">
        <h4>Ready to Proceed?</h4>
        <p><strong>Phone:</strong> (03) 9123 4567</p>
        <p><strong>Email:</strong> ${this.settings.fromEmail}</p>
        <p><strong>Address:</strong> Melbourne, VIC</p>
        <p><strong>Website:</strong> ${this.settings.siteUrl}</p>
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
        <p>&copy; 2024 Auto Panel Repair. All rights reserved. | Licensed Motor Vehicle Trader</p>
        <p>Generated on ${new Date().toLocaleDateString('en-AU')} at ${new Date().toLocaleTimeString('en-AU')}</p>
    </div>
</body>
</html>
    `;
  }

  async generateHTML(quote: Quote): Promise<Buffer> {
    // Generate HTML preview of the quote
    const html = this.generateQuoteHTML(quote);
    return Buffer.from(html, 'utf-8');
  }

  // Deprecated: Use generateHTML instead
  async generatePDF(quote: Quote): Promise<Buffer> {
    return this.generateHTML(quote);
  }

  getQuoteFileName(quote: Quote): string {
    const vehicleRego = quote.vehicleRego || 'unknown-vehicle';
    return `quote-${quote.id.slice(0, 8)}-${vehicleRego}.html`;
  }
}
