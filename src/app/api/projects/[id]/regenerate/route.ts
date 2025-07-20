import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { projects, sessions, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { level, customPrompt } = body;

    // Fetch the project
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .limit(1);

    if (!project || !project.paperText) {
      return NextResponse.json({ error: "Project or paper text not found" }, { status: 404 });
    }

    // Initialize AI services
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const embeddings = new GoogleGenerativeAIEmbeddings();

    // Load existing vector store for RAG context
    let ragContext = "";
    if (project.vectorStorePath) {
      try {
        const vectorStore = await FaissStore.load(project.vectorStorePath, embeddings);
        const relevantDocs = await vectorStore.similaritySearch(
          customPrompt || `${level} level summary`, 
          3
        );
        ragContext = relevantDocs.map(doc => doc.pageContent).join("\n\n");
      } catch (error) {
        console.log("Could not load vector store, proceeding without RAG context");
      }
    }

    // Get external context using Tavily
    const tavily = new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY! });
    let externalContext = "";
    
    try {
      const searchQuery = customPrompt || `${level} level research paper summary`;
      const searchResults = await tavily.invoke(searchQuery);
      externalContext = searchResults.slice(0, 2).map((result: any) => result.content).join("\n\n");
    } catch (error) {
      console.log("Could not fetch external context, proceeding without it");
    }

    // Build comprehensive context
    const fullContext = `
VECTOR STORE CONTEXT (RAG):
${ragContext}

EXTERNAL CONTEXT:
${externalContext}

RESEARCH PAPER:
${project.paperText.substring(0, 15000)}
    `;

    // Generate summary based on level or custom prompt
    let prompt = "";
    if (customPrompt) {
      prompt = `${customPrompt}\n\nUse the provided context to enhance your response.`;
    } else {
      switch (level) {
        case "eli5":
          prompt = "Summarize this research paper for a five-year-old (ELI5). Use simple words, fun analogies, and make it engaging. Explain complex concepts like you're talking to a curious child.";
          break;
        case "college":
          prompt = "Summarize this research paper for a college student. Include key concepts, methodology, findings, and implications. Use appropriate academic language while remaining accessible.";
          break;
        case "expert":
          prompt = "Summarize this research paper for a domain expert. Focus on technical details, methodology, statistical significance, limitations, and implications for the field.";
          break;
        default:
          prompt = "Provide a comprehensive summary of this research paper.";
      }
    }

    const result = await model.generateContent(`${prompt}\n\nCONTEXT:\n${fullContext}`);
    const generatedSummary = result.response.text();

    // Update the database with the new summary
    const updateData: any = {};
    if (!customPrompt) {
      switch (level) {
        case "eli5":
          updateData.summaryEli5 = generatedSummary;
          break;
        case "college":
          updateData.summaryCollege = generatedSummary;
          break;
        case "expert":
          updateData.summaryExpert = generatedSummary;
          break;
      }
      
      await db.update(projects)
        .set(updateData)
        .where(eq(projects.id, id));
    }

    return NextResponse.json({ 
      success: true, 
      summary: generatedSummary,
      level: level || "custom"
    });

  } catch (error) {
    console.error(`Error regenerating summary for project ${id}:`, error);
    return NextResponse.json({ error: "Failed to regenerate summary" }, { status: 500 });
  }
}