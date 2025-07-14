
import { db } from "@/database/db";
import { projects } from "@/database/schema";
import { processAndStorePaper } from "@/lib/services/ai-processing-service";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, params.id))
      .limit(1);

    if (!project || !project.paperText) {
      return NextResponse.json({ error: "Project or paper text not found" }, { status: 404 });
    }

    await db.update(projects).set({ status: 'processing' }).where(eq(projects.id, params.id));

    const analysisData = await processAndStorePaper(project.id, project.paperText);

    await db.update(projects)
      .set(analysisData)
      .where(eq(projects.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    await db.update(projects).set({ status: 'failed' }).where(eq(projects.id, params.id));
    console.error("Processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
