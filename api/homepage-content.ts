import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

async function isAuthenticated(req: VercelRequest): Promise<boolean> {
  const cookie = req.headers.cookie;
  if (!cookie) return false;
  const match = cookie.match(/owner_token=([^;]+)/);
  if (!match) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.OWNER_PIN_HASH || ""
    );
    await jwtVerify(match[1], secret);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("hwinnwin_homepage_content")
        .select("content")
        .eq("id", 1)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "No saved content" });
      }
      return res.json(data.content);
    }

    if (req.method === "PUT") {
      if (!(await isAuthenticated(req))) {
        return res.status(401).json({ message: "Owner session required" });
      }

      const content = req.body;
      if (!content || !content.en || !content.vi || !content.zh) {
        return res.status(400).json({ message: "Content must include en, vi, and zh locales" });
      }

      const supabase = getSupabase();
      const { error } = await supabase
        .from("hwinnwin_homepage_content")
        .upsert({ id: 1, content, updated_at: new Date().toISOString() });

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ message: "Failed to save content" });
      }

      return res.json({ success: true, message: "Homepage content saved" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: any) {
    console.error("Function error:", err);
    return res.status(500).json({ message: err.message || "Internal error" });
  }
}
