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
  logoUrl: text("logo_url").default("/static/auto-panel-logo.png"),
  primaryColor: text("primary_color").default("#1E40AF"),
  ownerPin: text("owner_pin").notNull(),
  isDefaultPin: integer("is_default_pin", { mode: "boolean" }).notNull().default(true),
  sendgridApiKey: text("sendgrid_api_key"),
  fromEmail: text("from_email").default("quotes@panelrepair.com"),
  siteUrl: text("site_url").default("https://panelrepair.com"),
  // Two-Factor Authentication fields
  twoFaEnabled: integer("two_fa_enabled", { mode: "boolean" }).notNull().default(false),
  twoFaEmail: text("two_fa_email"),
  otpSecret: text("otp_secret"), // Temporary storage for hashed OTP
  otpExpiresAt: text("otp_expires_at"), // ISO timestamp for OTP expiry
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

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(), // JSON content blocks
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
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

// PIN validation schema - 4-6 digit numeric for compatibility with frontend
export const pinValidationSchema = z.object({
  pin: z.string()
    .min(4, "PIN must be at least 4 digits")
    .max(6, "PIN must be no more than 6 digits")
    .regex(/^\d{4,6}$/, "PIN must contain only numbers (4-6 digits)")
    .refine(pin => pin !== "0000" && pin !== "1234" && pin !== "0123", 
           "PIN cannot be a simple sequence")
});

// PIN change schema with current PIN verification
export const pinChangeSchema = z.object({
  currentPin: z.string().min(1, "Current PIN is required"),
  newPin: z.string()
    .min(4, "New PIN must be at least 4 digits")
    .max(6, "New PIN must be no more than 6 digits")
    .regex(/^\d{4,6}$/, "New PIN must contain only numbers (4-6 digits)")
    .refine(pin => pin !== "0000" && pin !== "1234" && pin !== "0123", 
           "New PIN cannot be a simple sequence"),
  confirmPin: z.string()
}).refine(data => data.newPin === data.confirmPin, {
  message: "PIN confirmation does not match",
  path: ["confirmPin"]
}).refine(data => data.currentPin !== data.newPin, {
  message: "New PIN must be different from current PIN",
  path: ["newPin"]
});

// First-time PIN change schema (for fresh installations)
export const firstTimePinChangeSchema = z.object({
  newPin: z.string()
    .min(4, "New PIN must be at least 4 digits")
    .max(6, "New PIN must be no more than 6 digits")
    .regex(/^\d{4,6}$/, "New PIN must contain only numbers (4-6 digits)")
    .refine(pin => pin !== "0000" && pin !== "1234" && pin !== "0123", 
           "New PIN cannot be a simple sequence"),
  confirmPin: z.string()
}).refine(data => data.newPin === data.confirmPin, {
  message: "PIN confirmation does not match",
  path: ["confirmPin"]
});

// Two-Factor Authentication schemas
export const twoFaSettingsSchema = z.object({
  twoFaEnabled: z.boolean(),
  twoFaEmail: z.string().email("Please enter a valid email address").optional().or(z.literal(""))
}).refine(data => {
  // If 2FA is enabled, email must be provided
  if (data.twoFaEnabled && (!data.twoFaEmail || data.twoFaEmail === "")) {
    return false;
  }
  return true;
}, {
  message: "Email address is required when enabling 2FA",
  path: ["twoFaEmail"]
});

export const otpVerificationSchema = z.object({
  otp: z.string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers")
});

export const loginSchema = z.object({
  pin: z.string().min(1, "PIN is required")
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true // Make slug auto-generated
}).extend({
  content: z.string().min(1, "Page content is required") // JSON string validation
});

// Page content block schemas for structured page building
export const heroBlockSchema = z.object({
  type: z.literal("hero"),
  title: z.string().min(1, "Hero title is required"),
  subtitle: z.string().optional(),
  primaryCTA: z.object({
    text: z.string().min(1, "CTA text is required"),
    url: z.string().min(1, "CTA URL is required"),
    variant: z.enum(["primary", "secondary"]).default("primary")
  }).optional(),
  secondaryCTA: z.object({
    text: z.string().min(1, "CTA text is required"),
    url: z.string().min(1, "CTA URL is required"),
    variant: z.enum(["primary", "secondary"]).default("secondary")
  }).optional(),
  backgroundImage: z.string().optional()
});

export const textBlockSchema = z.object({
  type: z.literal("text"),
  content: z.string().min(1, "Text content is required"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  size: z.enum(["sm", "md", "lg", "xl"]).default("md")
});

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string().min(1, "Image source is required"),
  alt: z.string().min(1, "Image alt text is required"),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional()
});

export const productShowcaseSchema = z.object({
  type: z.literal("product"),
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Product description is required"),
  image: z.string().optional(),
  price: z.string().optional(),
  checkoutUrl: z.string().min(1, "Checkout URL is required"),
  features: z.array(z.string()).optional()
});

export const testimonialBlockSchema = z.object({
  type: z.literal("testimonial"),
  quote: z.string().min(1, "Testimonial quote is required"),
  author: z.string().min(1, "Author name is required"),
  company: z.string().optional(),
  image: z.string().optional()
});

export const contactFormBlockSchema = z.object({
  type: z.literal("contact"),
  title: z.string().min(1, "Contact form title is required"),
  description: z.string().optional(),
  fields: z.array(z.object({
    name: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(["text", "email", "textarea", "select"]),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional() // for select fields
  })).min(1, "At least one form field is required")
});

// Union of all content blocks
export const pageContentBlockSchema = z.discriminatedUnion("type", [
  heroBlockSchema,
  textBlockSchema,
  imageBlockSchema,
  productShowcaseSchema,
  testimonialBlockSchema,
  contactFormBlockSchema
]);

export const pageContentSchema = z.object({
  blocks: z.array(pageContentBlockSchema),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).optional()
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
export type PinValidation = z.infer<typeof pinValidationSchema>;
export type PinChange = z.infer<typeof pinChangeSchema>;
export type FirstTimePinChange = z.infer<typeof firstTimePinChangeSchema>;
export type TwoFaSettings = z.infer<typeof twoFaSettingsSchema>;
export type OtpVerification = z.infer<typeof otpVerificationSchema>;
export type Login = z.infer<typeof loginSchema>;

// Contact form schema for marketing site
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address").max(100, "Email is too long"),
  company: z.string().max(100, "Company name is too long").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number is too long").optional().or(z.literal("")),
  service: z.enum(["consulting", "strategy", "implementation", "custom", "other", ""]).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
  // Honeypot fields for spam protection (should always be empty)
  website: z.string().max(0, "Invalid request").optional().or(z.literal("")),
  url: z.string().max(0, "Invalid request").optional().or(z.literal("")),
  honeypot: z.string().max(0, "Invalid request").optional().or(z.literal(""))
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// YAML Content validation schemas
export const brandContentSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  pillars: z.array(z.string()).min(1, "At least one pillar is required"),
  voice: z.object({
    tone: z.string().min(1, "Voice tone is required"),
    rules: z.array(z.string()).min(1, "At least one voice rule is required")
  }),
  organization: z.object({
    legal_name: z.string().min(1, "Legal name is required"),
    hq: z.string().min(1, "Headquarters location is required"),
    email_public: z.string().min(1, "Public email is required"),
    booking_link: z.string().min(1, "Booking link is required")
  })
});

export const homeContentSchema = z.object({
  hero: z.object({
    headline: z.string().min(1, "Hero headline is required"),
    sub: z.string().min(1, "Hero sub-text is required"),
    primary_cta: z.string().min(1, "Primary CTA is required"),
    secondary_cta: z.string().min(1, "Secondary CTA is required")
  }),
  threeP: z.object({
    items: z.array(z.object({
      title: z.string().min(1, "3P item title is required"),
      text: z.string().min(1, "3P item text is required"),
      metric: z.string().min(1, "3P item metric is required")
    })).min(1, "At least one 3P item is required")
  }),
  process: z.array(z.string()).min(1, "At least one process step is required"),
  logos: z.array(z.string()),
  faq: z.array(z.object({
    q: z.string().min(1, "FAQ question is required"),
    a: z.string().min(1, "FAQ answer is required")
  }))
});

export const servicesContentSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, "Service name is required"),
    promise: z.string().min(1, "Service promise is required"),
    outcomes: z.array(z.string()).min(1, "At least one outcome is required"),
    from_aud: z.number().min(0, "Price must be non-negative")
  })).min(1, "At least one service is required")
});

export const marketingContentSchema = z.object({
  brand: brandContentSchema,
  home: homeContentSchema,
  services: servicesContentSchema
});

// Types for YAML content
export type BrandContent = z.infer<typeof brandContentSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type MarketingContent = z.infer<typeof marketingContentSchema>;

// Page types
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type PageContentBlock = z.infer<typeof pageContentBlockSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type HeroBlock = z.infer<typeof heroBlockSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type ProductShowcase = z.infer<typeof productShowcaseSchema>;
export type TestimonialBlock = z.infer<typeof testimonialBlockSchema>;
export type ContactFormBlock = z.infer<typeof contactFormBlockSchema>;

