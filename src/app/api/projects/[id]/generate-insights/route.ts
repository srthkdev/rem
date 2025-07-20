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
          "code snippets algorithms implementation methodology", 
          5
        );
        ragContext = relevantDocs.map(doc => doc.pageContent).join("\n\n");
      } catch (error) {
        console.log("Could not load vector store, proceeding without RAG context");
      }
    }

    // Get external context using Tavily for related research
    const tavily = new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY! });
    let externalContext = "";
    
    try {
      // Extract key terms for better search
      const keyTermsResult = await model.generateContent(`
        Extract 3-5 key technical terms from this research paper for web search. 
        Return only a JSON array of strings.
        
        Paper: ${project.paperText.substring(0, 5000)}
      `);
      
      const keyTerms = JSON.parse(keyTermsResult.response.text().replace(/```json\n?|```\n?/g, '').trim());
      const searchResults = await Promise.all(
        keyTerms.slice(0, 3).map((term: string) => tavily.invoke(`${term} research implementation`))
      );
      externalContext = searchResults.flat().slice(0, 3).map(result => result.content).join("\n\n");
    } catch (error) {
      console.log("Could not fetch external context, proceeding without it");
    }

    // Build comprehensive context
    const fullContext = `
VECTOR STORE CONTEXT (RAG):
${ragContext}

EXTERNAL RESEARCH CONTEXT:
${externalContext}

RESEARCH PAPER:
${project.paperText.substring(0, 15000)}
    `;

    // Helper function to clean AI responses
    const cleanResponse = (text: string) => {
      return text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^```/g, '')
        .replace(/```$/g, '')
        .trim();
    };

    // Generate insights in parallel
    const [codeSnippetsResult, referencesResult, keyInsightsResult] = await Promise.all([
      model.generateContent(`
        Extract and enhance code snippets, algorithms, or technical implementations from the research paper.
        Use the provided context to add explanations and improvements.
        
        Return ONLY a JSON object with this structure:
        {
          "codeSnippets": [
            {
              "description": "Clear description of what this code does",
              "code": "The actual code or pseudocode",
              "language": "programming language or 'pseudocode'",
              "enhancement": "AI-enhanced explanation or improvement suggestion"
            }
          ]
        }
        
        If no code is found, return {"codeSnippets": []}.
        
        CONTEXT:
        ${fullContext}
      `),
      
      model.generateContent(`
        Extract and enhance references, citations, and related work from the research paper.
        Use the external context to find additional relevant resources.
        
        Return ONLY a JSON object with this structure:
        {
          "references": [
            {
              "title": "Reference title",
              "url": "URL if available, or 'Not available'",
              "description": "Brief description of relevance",
              "type": "journal|conference|book|website|other"
            }
          ]
        }
        
        If no references are found, return {"references": []}.
        
        CONTEXT:
        ${fullContext}
      `),
      
      model.generateContent(`
        Generate key insights, implications, and future research directions based on the research paper.
        Use the provided context to enhance and expand the insights.
        
        Return ONLY a JSON object with this structure:
        {
          "insights": [
            {
              "title": "Insight title",
              "description": "Detailed explanation",
              "category": "methodology|findings|implications|future_work|limitations",
              "significance": "high|medium|low"
            }
          ]
        }
        
        Generate 5-8 meaningful insights.
        
        CONTEXT:
        ${fullContext}
      `)
    ]);

    // Parse results with error handling
    let codeSnippets = [];
    let references = [];
    let keyInsights = [];

    try {
      const codeData = JSON.parse(cleanResponse(codeSnippetsResult.response.text()));
      codeSnippets = codeData.codeSnippets || [];
    } catch (error) {
      console.log("Failed to parse code snippets:", error);
    }

    try {
      const refData = JSON.parse(cleanResponse(referencesResult.response.text()));
      references = refData.references || [];
    } catch (error) {
      console.log("Failed to parse references:", error);
    }

    try {
      const insightsData = JSON.parse(cleanResponse(keyInsightsResult.response.text()));
      keyInsights = insightsData.insights || [];
    } catch (error) {
      console.log("Failed to parse insights:", error);
    }

    // Update the database with enhanced insights
    await db.update(projects)
      .set({
        extractedCodeSnippets: codeSnippets,
        extractedReferences: references,
        // Store key insights in a new field (you may need to add this to schema)
      })
      .where(eq(projects.id, id));

    return NextResponse.json({ 
      success: true, 
      codeSnippets,
      references,
      keyInsights
    });

  } catch (error) {
    console.error(`Error generating insights for project ${id}:`, error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}