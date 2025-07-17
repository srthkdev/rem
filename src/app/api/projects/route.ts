import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { projects, sessions, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Validation schema for project creation
const createProjectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  paper: z.any().optional(),
  arxivId: z.string().optional(),
  abstract: z.string().optional(),
  authors: z.array(z.string()).optional(),
  pdfUrl: z.string().url().optional(),
  publishedDate: z.string().optional(),
  paperText: z.string().optional(),
});

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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const validatedData = createProjectSchema.parse(body);
    const now = new Date();
    const projectId = uuidv4();
    
    // Clean the paperText to remove null bytes and invalid UTF-8 characters
    let cleanedPaperText = validatedData.paperText;
    if (cleanedPaperText) {
      // Remove null bytes and other invalid characters
      cleanedPaperText = cleanedPaperText
        .replace(/\x00/g, '') // Remove null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
        .trim();
    }
    
    await db.insert(projects).values({
      id: projectId,
      userId: user.id,
      title: validatedData.title,
      description: validatedData.description || "",
      paper: validatedData.paper || null,
      paperText: cleanedPaperText || null,
      createdAt: now,
      updatedAt: now,
    });
    // Optionally, you can store arXiv fields in a separate table or as JSON in description
    return NextResponse.json({ success: true, id: projectId }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id));
    return NextResponse.json(userProjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
