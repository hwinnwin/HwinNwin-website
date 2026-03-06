import type { VercelRequest, VercelResponse } from "@vercel/node";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";

async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = process.env.OWNER_PIN_HASH;
  if (!storedHash) return false;
  return compare(pin, storedHash);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { pin } = req.body || {};
    if (!pin) {
      return res.status(400).json({ message: "PIN required" });
    }

    if (!(await verifyPin(pin))) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.OWNER_PIN_HASH || ""
    );
    const token = await new SignJWT({ role: "owner" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    res.setHeader("Set-Cookie", [
      `owner_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
    ]);

    return res.json({
      message: "Authentication successful",
      requiresOTP: false,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ message: err.message || "Internal error" });
  }
}
