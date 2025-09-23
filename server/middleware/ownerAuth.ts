import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

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
    
    if (pin !== settings.ownerPin) {
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
