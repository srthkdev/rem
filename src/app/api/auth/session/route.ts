import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { sessions, users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get("session-token")?.value;
  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, sessionToken));
  if (sessionRows.length === 0) {
    return NextResponse.json({ user: null });
  }
  const session = sessionRows[0];
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ user: null });
  }
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));
  if (userRows.length === 0) {
    return NextResponse.json({ user: null });
  }
  const user = userRows[0];
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  });
}
