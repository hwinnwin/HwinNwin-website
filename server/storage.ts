import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import type { 
  Quote, 
  InsertQuote, 
  InsertQuoteForStorage,
  Settings, 
  InsertSettings, 
  Testimonial, 
  InsertTestimonial,
  QuoteStatusHistory,
  DamageItem,
  QuoteCalculation,
  Page,
  InsertPage
} from "@shared/schema";

export interface IStorage {
  // Quotes
  createQuote(quote: InsertQuoteForStorage): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuoteBySlug(slug: string): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<boolean>;
  
  // Quote status history
  addQuoteStatusHistory(quoteId: string, status: Quote["status"], notes?: string): Promise<void>;
  getQuoteStatusHistory(quoteId: string): Promise<QuoteStatusHistory[]>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Testimonials
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getAllTestimonials(): Promise<Testimonial[]>;
  
  // Analytics
  getAnalytics(): Promise<{
    totalQuotes: number;
    approvedQuotes: number;
    averageTotal: number;
    pendingReview: number;
    last7Days: number;
    conversionRate: number;
  }>;
  
  // Pages
  createPage(page: InsertPage): Promise<Page>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getAllPages(includePublishedOnly?: boolean): Promise<Page[]>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;
}

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, "app.db");
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        labour_rate REAL NOT NULL DEFAULT 120,
        materials_per_panel REAL NOT NULL DEFAULT 85,
        parts_markup REAL NOT NULL DEFAULT 0.15,
        metallic_multiplier REAL NOT NULL DEFAULT 1.15,
        pearlescent_multiplier REAL NOT NULL DEFAULT 1.25,
        min_job REAL NOT NULL DEFAULT 220,
        logo_url TEXT DEFAULT '/static/lee-logo.png',
        primary_color TEXT DEFAULT '#1E40AF',
        owner_pin TEXT NOT NULL,
        is_default_pin INTEGER NOT NULL DEFAULT 1,
        sendgrid_api_key TEXT,
        from_email TEXT DEFAULT 'quotes@leemurdokpanels.com.au',
        site_url TEXT DEFAULT 'https://lee888.com.au',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        status TEXT CHECK(status IN ('new', 'approved', 'sent')) NOT NULL DEFAULT 'new',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        vehicle_rego TEXT NOT NULL,
        vehicle_make TEXT NOT NULL,
        vehicle_model TEXT NOT NULL,
        vehicle_year TEXT NOT NULL,
        vehicle_paint TEXT CHECK(vehicle_paint IN ('solid', 'metallic', 'pearlescent')) NOT NULL,
        items_json TEXT NOT NULL,
        rates_json TEXT NOT NULL,
        calc_json TEXT NOT NULL,
        photos_json TEXT,
        owner_notes TEXT,
        customer_link_slug TEXT NOT NULL UNIQUE,
        photos_representative_confirmed INTEGER NOT NULL DEFAULT 0,
        provisional_estimate_confirmed INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS quote_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
        status TEXT CHECK(status IN ('new', 'approved', 'sent')) NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id TEXT NOT NULL REFERENCES quotes(id),
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        consent_for_promo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT CHECK(status IN ('draft', 'published')) NOT NULL DEFAULT 'draft',
        seo_title TEXT,
        seo_description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
      CREATE INDEX IF NOT EXISTS idx_quotes_slug ON quotes(customer_link_slug);
      CREATE INDEX IF NOT EXISTS idx_quote_history_quote_id ON quote_status_history(quote_id);
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
      CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
    `);

    // Handle settings initialization and migration
    const settingsExists = this.db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
    if (settingsExists.count === 0) {
      // New installation - initialize with default PIN
      this.db.prepare(`
        INSERT INTO settings (id, owner_pin, is_default_pin) VALUES (1, '123456', 1)
      `).run();
    } else {
      // Existing installation - check if migration is needed
      try {
        const existingSettings = this.db.prepare("SELECT is_default_pin FROM settings WHERE id = 1").get() as any;
        if (existingSettings === undefined || existingSettings.is_default_pin === undefined) {
          // Add the new field for existing installations
          this.db.exec("ALTER TABLE settings ADD COLUMN is_default_pin INTEGER NOT NULL DEFAULT 1");
        }
      } catch (error) {
        // Column might already exist, ignore error
      }

      // Data migration: Fix existing bad JSON rows (one-time cleanup)
      this.migrateJsonFields();
    }
  }

  private migrateJsonFields(): void {
    try {
      // Fix any existing 'undefined' strings in JSON fields
      console.log('Running JSON field migration...');
      
      const quotesToFix = this.db.prepare(`
        SELECT id, items_json, rates_json, calc_json, photos_json 
        FROM quotes 
        WHERE items_json = 'undefined' 
           OR rates_json = 'undefined' 
           OR calc_json = 'undefined' 
           OR photos_json = 'undefined'
      `).all() as any[];

      let fixedCount = 0;
      for (const quote of quotesToFix) {
        const updates: any = {};
        
        if (quote.items_json === 'undefined') {
          updates.items_json = '[]';
        }
        if (quote.rates_json === 'undefined') {
          updates.rates_json = '{}';
        }
        if (quote.calc_json === 'undefined') {
          updates.calc_json = null;
        }
        if (quote.photos_json === 'undefined') {
          updates.photos_json = '[]';
        }

        if (Object.keys(updates).length > 0) {
          const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);
          
          this.db.prepare(`UPDATE quotes SET ${setClause} WHERE id = ?`)
            .run(...values, quote.id);
          fixedCount++;
        }
      }

      if (fixedCount > 0) {
        console.log(`Fixed ${fixedCount} quotes with bad JSON data`);
      }
    } catch (error) {
      console.error('JSON field migration error:', error);
    }
  }

  private generateSlug(): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private generatePageSlug(title: string): string {
    // Convert title to slug format
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Ensure slug is not empty
    if (!slug) {
      slug = 'page';
    }
    
    // Check for uniqueness and add suffix if needed
    let finalSlug = slug;
    let counter = 1;
    
    while (this.db.prepare("SELECT id FROM pages WHERE slug = ?").get(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  }

  async createQuote(insertQuote: InsertQuoteForStorage): Promise<Quote> {
    const id = randomUUID();
    const slug = this.generateSlug();
    const now = new Date().toISOString();

    const quote: Quote = {
      id,
      status: "new",
      createdAt: now,
      updatedAt: now,
      customerName: insertQuote.customerName,
      customerPhone: insertQuote.customerPhone,
      customerEmail: insertQuote.customerEmail,
      vehicleRego: insertQuote.vehicleRego,
      vehicleMake: insertQuote.vehicleMake,
      vehicleModel: insertQuote.vehicleModel,
      vehicleYear: insertQuote.vehicleYear,
      vehiclePaint: insertQuote.vehiclePaint,
      itemsJson: insertQuote.itemsJson,
      ratesJson: insertQuote.ratesJson,
      calcJson: insertQuote.calcJson,
      photosJson: insertQuote.photos ? JSON.stringify(insertQuote.photos) : null,
      ownerNotes: null,
      customerLinkSlug: slug,
      photosRepresentativeConfirmed: insertQuote.photosRepresentativeConfirmed ?? false,
      provisionalEstimateConfirmed: insertQuote.provisionalEstimateConfirmed ?? false
    };

    this.db.prepare(`
      INSERT INTO quotes (
        id, status, created_at, updated_at,
        customer_name, customer_phone, customer_email,
        vehicle_rego, vehicle_make, vehicle_model, vehicle_year, vehicle_paint,
        items_json, rates_json, calc_json, photos_json,
        owner_notes, customer_link_slug,
        photos_representative_confirmed, provisional_estimate_confirmed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      quote.id, quote.status, quote.createdAt, quote.updatedAt,
      quote.customerName, quote.customerPhone, quote.customerEmail,
      quote.vehicleRego, quote.vehicleMake, quote.vehicleModel, quote.vehicleYear, quote.vehiclePaint,
      quote.itemsJson, quote.ratesJson, quote.calcJson, quote.photosJson,
      quote.ownerNotes, quote.customerLinkSlug,
      quote.photosRepresentativeConfirmed ? 1 : 0,
      quote.provisionalEstimateConfirmed ? 1 : 0
    );

    await this.addQuoteStatusHistory(id, "new", "Quote created");
    return quote;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const result = this.db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as any;
    if (!result) return undefined;
    
    // Map snake_case database fields to camelCase application fields
    return {
      id: result.id,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      customerName: result.customer_name,
      customerPhone: result.customer_phone,
      customerEmail: result.customer_email,
      vehicleRego: result.vehicle_rego,
      vehicleMake: result.vehicle_make,
      vehicleModel: result.vehicle_model,
      vehicleYear: result.vehicle_year,
      vehiclePaint: result.vehicle_paint,
      itemsJson: result.items_json,
      ratesJson: result.rates_json,
      calcJson: result.calc_json,
      photosJson: result.photos_json,
      ownerNotes: result.owner_notes,
      customerLinkSlug: result.customer_link_slug,
      photosRepresentativeConfirmed: Boolean(result.photos_representative_confirmed),
      provisionalEstimateConfirmed: Boolean(result.provisional_estimate_confirmed)
    };
  }

  async getQuoteBySlug(slug: string): Promise<Quote | undefined> {
    const result = this.db.prepare("SELECT * FROM quotes WHERE customer_link_slug = ?").get(slug) as any;
    if (!result) return undefined;
    
    // Map snake_case database fields to camelCase application fields
    return {
      id: result.id,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      customerName: result.customer_name,
      customerPhone: result.customer_phone,
      customerEmail: result.customer_email,
      vehicleRego: result.vehicle_rego,
      vehicleMake: result.vehicle_make,
      vehicleModel: result.vehicle_model,
      vehicleYear: result.vehicle_year,
      vehiclePaint: result.vehicle_paint,
      itemsJson: result.items_json,
      ratesJson: result.rates_json,
      calcJson: result.calc_json,
      photosJson: result.photos_json,
      ownerNotes: result.owner_notes,
      customerLinkSlug: result.customer_link_slug,
      photosRepresentativeConfirmed: Boolean(result.photos_representative_confirmed),
      provisionalEstimateConfirmed: Boolean(result.provisional_estimate_confirmed)
    };
  }

  async getAllQuotes(): Promise<Quote[]> {
    const results = this.db.prepare("SELECT * FROM quotes ORDER BY created_at DESC").all() as any[];
    
    return results.map(result => ({
      ...result,
      photosRepresentativeConfirmed: Boolean(result.photos_representative_confirmed),
      provisionalEstimateConfirmed: Boolean(result.provisional_estimate_confirmed)
    }));
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | undefined> {
    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
    
    if (fields.length === 0) {
      return this.getQuote(id);
    }

    const setClause = fields.map(field => {
      if (field === 'photosRepresentativeConfirmed' || field === 'provisionalEstimateConfirmed') {
        return `${field.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`;
      }
      return `${field.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`;
    }).join(', ');
    
    const values = fields.map(field => {
      const value = updates[field as keyof Quote];
      if (field === 'photosRepresentativeConfirmed' || field === 'provisionalEstimateConfirmed') {
        return value ? 1 : 0;
      }
      return value;
    });

    this.db.prepare(`
      UPDATE quotes 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `).run(...values, now, id);

    return this.getQuote(id);
  }

  async deleteQuote(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM quotes WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async addQuoteStatusHistory(quoteId: string, status: Quote["status"], notes?: string): Promise<void> {
    this.db.prepare(`
      INSERT INTO quote_status_history (quote_id, status, notes)
      VALUES (?, ?, ?)
    `).run(quoteId, status, notes || null);
  }

  async getQuoteStatusHistory(quoteId: string): Promise<QuoteStatusHistory[]> {
    return this.db.prepare(`
      SELECT * FROM quote_status_history 
      WHERE quote_id = ? 
      ORDER BY timestamp DESC
    `).all(quoteId) as QuoteStatusHistory[];
  }

  async getSettings(): Promise<Settings> {
    const result = this.db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    if (!result) {
      throw new Error("Settings not found");
    }
    
    // Map database column names (snake_case) to object properties (camelCase)
    return {
      id: result.id,
      labourRate: result.labour_rate,
      materialsPerPanel: result.materials_per_panel,
      partsMarkup: result.parts_markup,
      metallicMultiplier: result.metallic_multiplier,
      pearlescentMultiplier: result.pearlescent_multiplier,
      minJob: result.min_job,
      logoUrl: result.logo_url,
      primaryColor: result.primary_color,
      ownerPin: result.owner_pin,
      isDefaultPin: Boolean(result.is_default_pin),
      sendgridApiKey: result.sendgrid_api_key,
      fromEmail: result.from_email,
      siteUrl: result.site_url,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  }

  async updateSettings(settings: Partial<InsertSettings>): Promise<Settings> {
    const now = new Date().toISOString();
    const fields = Object.keys(settings);
    
    if (fields.length > 0) {
      const setClause = fields.map(field => 
        `${field.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`
      ).join(', ');
      
      const values = fields.map(field => {
        const value = settings[field as keyof InsertSettings];
        // Convert boolean to integer for SQLite compatibility
        if (field === 'isDefaultPin' && typeof value === 'boolean') {
          return value ? 1 : 0;
        }
        return value;
      });

      this.db.prepare(`
        UPDATE settings 
        SET ${setClause}, updated_at = ?
        WHERE id = 1
      `).run(...values, now);
    }

    return this.getSettings();
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const result = this.db.prepare(`
      INSERT INTO testimonials (quote_id, customer_name, rating, comment, consent_for_promo)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).get(
      testimonial.quoteId,
      testimonial.customerName,
      testimonial.rating,
      testimonial.comment,
      testimonial.consentForPromo ? 1 : 0
    ) as any;

    return {
      ...result,
      consentForPromo: Boolean(result.consent_for_promo)
    };
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    const results = this.db.prepare("SELECT * FROM testimonials ORDER BY created_at DESC").all() as any[];
    
    return results.map(result => ({
      ...result,
      consentForPromo: Boolean(result.consent_for_promo)
    }));
  }

  async getAnalytics() {
    const totalQuotes = this.db.prepare("SELECT COUNT(*) as count FROM quotes").get() as { count: number };
    const approvedQuotes = this.db.prepare("SELECT COUNT(*) as count FROM quotes WHERE status = 'approved'").get() as { count: number };
    const pendingReview = this.db.prepare("SELECT COUNT(*) as count FROM quotes WHERE status = 'new'").get() as { count: number };
    
    const last7Days = this.db.prepare(`
      SELECT COUNT(*) as count FROM quotes 
      WHERE created_at >= datetime('now', '-7 days')
    `).get() as { count: number };

    const averageResult = this.db.prepare(`
      SELECT AVG(json_extract(calc_json, '$.totalIncGST')) as avg 
      FROM quotes 
      WHERE status = 'approved'
    `).get() as { avg: number | null };

    const conversionRate = totalQuotes.count > 0 ? (approvedQuotes.count / totalQuotes.count) * 100 : 0;

    return {
      totalQuotes: totalQuotes.count,
      approvedQuotes: approvedQuotes.count,
      averageTotal: averageResult.avg || 0,
      pendingReview: pendingReview.count,
      last7Days: last7Days.count,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }

  // Page CRUD operations
  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const slug = this.generatePageSlug(insertPage.title);

    const page: Page = {
      id,
      slug,
      title: insertPage.title,
      content: insertPage.content,
      status: insertPage.status || "draft",
      seoTitle: insertPage.seoTitle || null,
      seoDescription: insertPage.seoDescription || null,
      createdAt: now,
      updatedAt: now
    };

    this.db.prepare(`
      INSERT INTO pages (
        id, slug, title, content, status, seo_title, seo_description,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      page.id, page.slug, page.title, page.content, page.status,
      page.seoTitle, page.seoDescription, page.createdAt, page.updatedAt
    );

    return page;
  }

  async getPage(id: string): Promise<Page | undefined> {
    const result = this.db.prepare("SELECT * FROM pages WHERE id = ?").get(id) as any;
    if (!result) return undefined;
    
    return {
      id: result.id,
      slug: result.slug,
      title: result.title,
      content: result.content,
      status: result.status,
      seoTitle: result.seo_title,
      seoDescription: result.seo_description,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const result = this.db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as any;
    if (!result) return undefined;
    
    return {
      id: result.id,
      slug: result.slug,
      title: result.title,
      content: result.content,
      status: result.status,
      seoTitle: result.seo_title,
      seoDescription: result.seo_description,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  }

  async getAllPages(includePublishedOnly: boolean = false): Promise<Page[]> {
    const query = includePublishedOnly 
      ? "SELECT * FROM pages WHERE status = 'published' ORDER BY created_at DESC"
      : "SELECT * FROM pages ORDER BY created_at DESC";
    
    const results = this.db.prepare(query).all() as any[];
    
    return results.map(result => ({
      id: result.id,
      slug: result.slug,
      title: result.title,
      content: result.content,
      status: result.status,
      seoTitle: result.seo_title,
      seoDescription: result.seo_description,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    }));
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined> {
    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
    
    if (fields.length === 0) {
      return this.getPage(id);
    }

    const setClause = fields.map(field => {
      // Convert camelCase to snake_case for database fields
      switch (field) {
        case 'seoTitle':
          return 'seo_title = ?';
        case 'seoDescription':
          return 'seo_description = ?';
        case 'updatedAt':
          return 'updated_at = ?';
        default:
          return `${field} = ?`;
      }
    }).join(', ');
    
    const values = fields.map(field => updates[field as keyof Page]);

    this.db.prepare(`
      UPDATE pages 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `).run(...values, now, id);

    return this.getPage(id);
  }

  async deletePage(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM pages WHERE id = ?").run(id);
    return result.changes > 0;
  }
}

export const storage = new SqliteStorage();
