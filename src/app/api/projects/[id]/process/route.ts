
import { db } from "@/database/db";
import { projects } from "@/database/schema";
import { processAndStorePaper } from "@/lib/services/ai-processing-service";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[${id}] Processing request received`);
  try {
    console.log(`[${id}] Fetching project from database...`);
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project || !project.paperText) {
      console.error(`[${id}] Project or paper text not found.`);
      return NextResponse.json({ error: "Project or paper text not found" }, { status: 404 });
    }
    console.log(`[${id}] Project found. Setting status to 'processing'.`);

    await db.update(projects).set({ status: 'processing' }).where(eq(projects.id, id));
    console.log(`[${id}] Status updated. Starting AI processing...`);

    const analysisData = await processAndStorePaper(project.id, project.paperText);
    console.log(`[${id}] AI processing complete. Updating database with analysis data.`);

    await db.update(projects)
      .set(analysisData)
      .where(eq(projects.id, id));
    console.log(`[${id}] Database updated successfully.`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[${id}] Processing failed:`, error);
    await db.update(projects).set({ status: 'failed' }).where(eq(projects.id, id));
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
