import { z } from "zod";

export const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
export const hexColorRegex = /^#[0-9A-F]{6}$/i;

export const customerValidation = {
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().min(10, "Valid phone number is required").max(15, "Phone number too long"),
  email: z.string().email("Valid email is required").max(100, "Email too long")
};

export const vehicleValidation = {
  rego: z.string().min(1, "Registration is required").max(10, "Registration too long"),
  make: z.string().min(1, "Make is required").max(50, "Make too long"),
  model: z.string().min(1, "Model is required").max(50, "Model too long"),
  year: z.string().min(4, "Year is required").max(4, "Invalid year"),
  paint: z.enum(["solid", "metallic", "pearlescent"])
};

export const damageItemValidation = {
  panel: z.string().min(1, "Panel is required"),
  severity: z.enum(["minor", "moderate", "severe"]),
  partsCost: z.number().min(0, "Parts cost cannot be negative").max(50000, "Parts cost too high"),
  blend: z.boolean()
};

export const ratesValidation = {
  labourRate: z.number().min(0, "Labour rate cannot be negative").max(1000, "Labour rate too high"),
  materialsPerPanel: z.number().min(0, "Materials cost cannot be negative").max(1000, "Materials cost too high"),
  partsMarkup: z.number().min(0, "Markup cannot be negative").max(2, "Markup too high"),
  metallicMultiplier: z.number().min(1, "Multiplier must be at least 1").max(5, "Multiplier too high"),
  pearlescentMultiplier: z.number().min(1, "Multiplier must be at least 1").max(5, "Multiplier too high"),
  minJob: z.number().min(0, "Minimum job cannot be negative").max(10000, "Minimum job too high")
};

export const settingsValidation = {
  logoUrl: z.string().optional().refine(
    (url) => !url || url.startsWith('/') || url.startsWith('http'),
    "Logo URL must be a valid path or URL"
  ),
  primaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color"),
  fromEmail: z.string().email("Must be a valid email address"),
  siteUrl: z.string().url("Must be a valid URL"),
  sendgridApiKey: z.string().optional()
};

export const pinValidation = {
  current: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN must be at most 6 digits"),
  new: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN must be at most 6 digits")
    .regex(/^\d+$/, "PIN must contain only digits")
};

export function validateFileSize(file: File): string | null {
  const maxSize = 8 * 1024 * 1024; // 8MB
  const minSize = 10 * 1024; // 10KB
  
  if (file.size > maxSize) {
    return "File size exceeds 8MB limit";
  }
  
  if (file.size < minSize) {
    return "File size too small, may be corrupted";
  }
  
  return null;
}

export function validateFileType(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed";
  }
  
  return null;
}

export function validateImage(file: File): string[] {
  const errors: string[] = [];
  
  const sizeError = validateFileSize(file);
  if (sizeError) errors.push(sizeError);
  
  const typeError = validateFileType(file);
  if (typeError) errors.push(typeError);
  
  return errors;
}
