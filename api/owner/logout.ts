import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Clear the auth cookie
  res.setHeader("Set-Cookie", [
    "owner_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
  ]);

  return res.json({ message: "Logged out" });
}
