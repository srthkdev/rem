import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users, accounts, sessions } from "@/database/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.errors },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;
  // Find user
  const userRows = await db.select().from(users).where(eq(users.email, email));
  if (userRows.length === 0) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }
  const user = userRows[0];
  // Find account
  const accountRows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id));
  if (accountRows.length === 0) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }
  const account = accountRows[0];
  // Verify password
  const valid = await bcrypt.compare(password, account.password!);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }
  // Create session
  const sessionToken = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  await db.insert(sessions).values({
    id: `sess-${Date.now()}`,
    expiresAt,
    token: sessionToken,
    createdAt: now,
    updatedAt: now,
    userId: user.id,
  });
  // Set cookie
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
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
