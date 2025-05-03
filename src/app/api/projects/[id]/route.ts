import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { projects, sessions, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";

// Helper to get user from session-token cookie
async function getUserFromRequest(req: NextRequest) {
  const sessionToken = req.cookies.get("session-token")?.value;
  if (!sessionToken) return null;
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, sessionToken));
  if (sessionRows.length === 0 || sessionRows[0].expiresAt < new Date())
    return null;
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionRows[0].userId));
  if (userRows.length === 0) return null;
  return userRows[0];
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Extract project ID from URL
    const url = new URL(request.url);
    const projectId = url.pathname.split("/").pop();
    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    // Only allow deleting user's own project
    await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
