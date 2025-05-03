import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users, accounts, sessions } from "@/database/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.errors },
      { status: 400 },
    );
  }
  const { email, password, username } = parsed.data;
  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  const now = new Date();
  const userId = `user-${Date.now()}`;
  // Insert user
  await db.insert(users).values({
    id: userId,
    name: username,
    email,
    emailVerified: null,
    image: null,
    createdAt: now,
    updatedAt: now,
  });
  // Insert account
  await db.insert(accounts).values({
    id: `acc-${Date.now()}`,
    accountId: email,
    providerId: "credentials",
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });
  // Create session
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  await db.insert(sessions).values({
    id: `sess-${Date.now()}`,
    expiresAt,
    token: sessionToken,
    createdAt: now,
    updatedAt: now,
    userId,
  });
  // Set cookie
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({
    success: true,
    user: { id: userId, email, name: username },
  });
  response.cookies.set("session-token", sessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return response;
}
