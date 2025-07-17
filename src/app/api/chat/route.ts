import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { projects } from "@/database/schema";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project and vector store path
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project || !project.vectorStorePath) {
      return NextResponse.json({ error: 'Project or vector store not found' }, { status: 404 });
    }

    // Load the vector store
    const embeddings = new GoogleGenerativeAIEmbeddings();
    const vectorStore = await FaissStore.load(project.vectorStorePath, embeddings);

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Search for relevant context
    const searchResults = await vectorStore.similaritySearch(lastMessage.content, 5);
    const context = searchResults.map(doc => doc.pageContent).join('\n\n');

    // Create the prompt with context
    const prompt = `You are an AI assistant helping with a research paper analysis. Use the following context from the paper to answer the user's question. If the context doesn't contain enough information to answer the question, say so.

CONTEXT FROM THE PAPER:
${context}

USER QUESTION:
${lastMessage.content}

Please provide a helpful, accurate response based on the paper content.`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ 
      role: 'assistant', 
      content: response 
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}