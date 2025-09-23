import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey().default(1),
  labourRate: real("labour_rate").notNull().default(120),
  materialsPerPanel: real("materials_per_panel").notNull().default(85),
  partsMarkup: real("parts_markup").notNull().default(0.15),
  metallicMultiplier: real("metallic_multiplier").notNull().default(1.15),
  pearlescentMultiplier: real("pearlescent_multiplier").notNull().default(1.25),
  minJob: real("min_job").notNull().default(220),
  logoUrl: text("logo_url").default("/static/lee-logo.png"),
  primaryColor: text("primary_color").default("#1E40AF"),
  ownerPin: text("owner_pin").notNull().default("123456"),
  sendgridApiKey: text("sendgrid_api_key"),
  fromEmail: text("from_email").default("quotes@leemurdokpanels.com.au"),
  siteUrl: text("site_url").default("https://lee888.com.au"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const quotes = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  status: text("status", { enum: ["new", "approved", "sent"] }).notNull().default("new"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  
  // Customer info
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull(),
  
  // Vehicle info
  vehicleRego: text("vehicle_rego").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: text("vehicle_year").notNull(),
  vehiclePaint: text("vehicle_paint", { enum: ["solid", "metallic", "pearlescent"] }).notNull(),
  
  // Damage assessment
  itemsJson: text("items_json").notNull(), // Array of damage items
  ratesJson: text("rates_json").notNull(), // Snapshot of rates at quote time
  calcJson: text("calc_json").notNull(), // Calculation results
  
  // Photos
  photosJson: text("photos_json"), // Array of photo file paths
  
  // Owner notes and approval
  ownerNotes: text("owner_notes"),
  customerLinkSlug: text("customer_link_slug").notNull().unique(),
  
  // Terms acceptance
  photosRepresentativeConfirmed: integer("photos_representative_confirmed", { mode: "boolean" }).notNull().default(false),
  provisionalEstimateConfirmed: integer("provisional_estimate_confirmed", { mode: "boolean" }).notNull().default(false)
});

export const quoteStatusHistory = sqliteTable("quote_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteId: text("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["new", "approved", "sent"] }).notNull(),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes")
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteId: text("quote_id").notNull().references(() => quotes.id),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  consentForPromo: integer("consent_for_promo", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Validation schemas
export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  customerLinkSlug: true,
  itemsJson: true,  // Omit server-generated fields
  ratesJson: true,
  calcJson: true,
  photosJson: true
}).extend({
  items: z.array(z.object({
    panel: z.string().min(1),
    severity: z.enum(["minor", "moderate", "severe"]),
    partsCost: z.number().min(0).default(0),
    blend: z.boolean().default(false)
  })).min(1),
  photos: z.array(z.string()).optional()
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true
});

export const damageItemSchema = z.object({
  panel: z.string().min(1),
  severity: z.enum(["minor", "moderate", "severe"]),
  partsCost: z.number().min(0).default(0),
  blend: z.boolean().default(false)
});

export const quoteCalculationSchema = z.object({
  repairHrs: z.number(),
  paintHrs: z.number(),
  labour: z.number(),
  materials: z.number(),
  parts: z.number(),
  subtotalExGST: z.number(),
  gst: z.number(),
  totalIncGST: z.number(),
  blendPanels: z.number(),
  confidence: z.enum(["high", "low"])
});

// Types
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertQuoteForStorage = InsertQuote & {
  itemsJson: string;
  ratesJson: string;
  calcJson: string;
  photos: string[];
};
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type QuoteStatusHistory = typeof quoteStatusHistory.$inferSelect;
export type DamageItem = z.infer<typeof damageItemSchema>;
export type QuoteCalculation = z.infer<typeof quoteCalculationSchema>;
