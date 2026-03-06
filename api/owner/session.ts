import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtVerify } from "jose";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const cookie = req.headers.cookie;
  if (!cookie) {
    return res.status(401).json({ message: "Owner session required" });
  }

  const match = cookie.match(/owner_token=([^;]+)/);
  if (!match) {
    return res.status(401).json({ message: "Owner session required" });
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.OWNER_PIN_HASH || ""
    );
    await jwtVerify(match[1], secret);
    return res.json({ authenticated: true, role: "owner" });
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}
