import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { sessions } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("session-token")?.value;
  if (sessionToken) {
    await db.delete(sessions).where(eq(sessions.token, sessionToken));
  }
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true });
  response.cookies.set("session-token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
