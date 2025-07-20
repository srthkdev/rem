import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { projects, sessions, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

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
    const { diagramType = "flowchart" } = body;

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
          "methodology workflow process diagram", 
          3
        );
        ragContext = relevantDocs.map(doc => doc.pageContent).join("\n\n");
      } catch (error) {
        console.log("Could not load vector store, proceeding without RAG context");
      }
    }

    // Build comprehensive context
    const fullContext = `
VECTOR STORE CONTEXT (RAG):
${ragContext}

RESEARCH PAPER:
${project.paperText.substring(0, 12000)}
    `;

    let diagramPrompt = "";
    
    switch (diagramType) {
      case "flowchart":
        diagramPrompt = `Create a valid Mermaid.js flowchart that visualizes the core methodology or workflow described in the research paper.

CRITICAL SYNTAX RULES - FOLLOW EXACTLY:
1. First line: "flowchart TD"
2. Each subsequent line: NodeID[Label] --> NodeID[Label]
3. Node IDs: Only A, B, C, D, E, F (single letters)
4. Labels: Max 12 characters, no parentheses, no special chars
5. Each connection on its own line
6. Maximum 5 nodes total

EXACT FORMAT TO FOLLOW:
flowchart TD
A[Data Input] --> B[Processing]
B[Processing] --> C[Analysis]
C[Analysis] --> D[Results]

Return ONLY the Mermaid syntax following the exact format above.`;
        break;
        
      case "mindmap":
        diagramPrompt = `Create a valid Mermaid.js mindmap that shows the key concepts and relationships in the research paper.

CRITICAL SYNTAX RULES - FOLLOW EXACTLY:
1. First line: "mindmap"
2. Second line: "  root((Topic))" (2 spaces, max 8 chars in topic)
3. Third level: "    Branch" (4 spaces, max 8 chars)
4. Fourth level: "      Item" (6 spaces, max 8 chars)
5. Maximum 4 branches, 2 items per branch

EXACT FORMAT TO FOLLOW:
mindmap
  root((Study))
    Methods
      Survey
      Analysis
    Results
      Data
      Insights

Return ONLY the Mermaid syntax following the exact format above.`;
        break;
        
      case "timeline":
        diagramPrompt = `Create a valid Mermaid.js timeline that shows the research process or historical development mentioned in the paper.

CRITICAL SYNTAX RULES:
1. Start with exactly "timeline"
2. Title format: title Research Process
3. Entry format: Year : Event Description
4. Keep descriptions short (max 15 characters)
5. Use realistic years or phases

VALID FORMAT:
timeline
    title Research Process
    Phase 1 : Planning
    Phase 2 : Data Collection
    Phase 3 : Analysis
    Phase 4 : Results

Return ONLY the Mermaid syntax without code blocks or explanations.`;
        break;
        
      default:
        diagramPrompt = `Create a valid Mermaid.js flowchart that visualizes the core concepts in the research paper.`;
    }

    const result = await model.generateContent(`${diagramPrompt}\n\nCONTEXT:\n${fullContext}`);
    let diagramSyntax = result.response.text()
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    // Clean and validate the generated syntax
    if (!diagramSyntax || diagramSyntax.length < 10) {
      diagramSyntax = `flowchart TD
A[Research Paper] --> B[Data Analysis]
B --> C[Results]
C --> D[Conclusions]`;
    }

    // Additional cleaning for common issues
    diagramSyntax = diagramSyntax
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
      .replace(/\s*;\s*/g, '') // Remove semicolons
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*\n\s*/g, '\n') // Clean line breaks
      .trim();

    // Update the database with the new diagram
    await db.update(projects)
      .set({ diagramSyntax })
      .where(eq(projects.id, id));

    return NextResponse.json({ 
      success: true, 
      diagramSyntax,
      diagramType
    });

  } catch (error) {
    console.error(`Error regenerating diagram for project ${id}:`, error);
    return NextResponse.json({ error: "Failed to regenerate diagram" }, { status: 500 });
  }
}