import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { pinValidationSchema, pinChangeSchema } from "@shared/schema";
import { generalRateLimiter } from "./rateLimiter";
import { comparePin, isPinHashed } from "../services/pinService";

// Extend the session interface
declare module 'express-session' {
  interface SessionData {
    isOwner?: boolean;
  }
}

export async function requireOwnerPin(req: Request, res: Response, next: NextFunction) {
  try {
    const pin = req.body.ownerPin || req.headers['x-owner-pin'];
    
    if (!pin) {
      return res.status(401).json({ message: "Owner PIN required" });
    }

    const settings = await storage.getSettings();
    
    // Check if using default PIN in production
    if (process.env.NODE_ENV === 'production' && settings.isDefaultPin) {
      return res.status(403).json({ 
        message: "Default PIN must be changed before accessing owner features in production",
        requiresPinChange: true 
      });
    }
    
    // Use constant-time comparison for hashed PINs, fallback to plaintext for migration
    const isValidPin = isPinHashed(settings.ownerPin) 
      ? await comparePin(pin, settings.ownerPin)
      : pin === settings.ownerPin;
      
    if (!isValidPin) {
      return res.status(401).json({ message: "Invalid owner PIN" });
    }

    next();
  } catch (error) {
    console.error('Owner auth error:', error);
    res.status(500).json({ message: "Authentication error" });
  }
}

export function createOwnerSession(req: Request, res: Response, next: NextFunction) {
  // Set a session flag for subsequent requests
  if (req.session) {
    req.session.isOwner = true;
  }
  next();
}

export function requireOwnerSession(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isOwner) {
    return next();
  }
  
  res.status(401).json({ message: "Owner session required" });
}

// Rate-limited PIN change middleware - reuse general rate limiter
export const pinChangeRateLimit = generalRateLimiter;

// Validate PIN change request
export async function validatePinChange(req: Request, res: Response, next: NextFunction) {
  try {
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

    // Store validated data for next middleware
    req.body.validatedPinChange = validationResult.data;
    next();
  } catch (error) {
    console.error('PIN change validation error:', error);
    res.status(500).json({ message: "PIN change validation failed" });
  }
}
