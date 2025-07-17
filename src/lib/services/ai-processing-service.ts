

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { promises as fs } from 'fs';

if (!process.env.GEMINI_API_KEY || !process.env.TAVILY_API_KEY) {
  throw new Error("Missing API keys (GEMINI_API_KEY or TAVILY_API_KEY)");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = new ChatGoogleGenerativeAI({ model: "gemini-2.0-flash-exp" });
const embeddings = new GoogleGenerativeAIEmbeddings();

// --- Part 1: The Processing Pipeline ---
export async function processAndStorePaper(projectId: string, paperText: string) {
  console.log(`[${projectId}] Starting paper processing...`);
  // Step 1: Create and save the Vector Store for RAG chat
  console.log(`[${projectId}] Creating vector store...`);
  const vectorStorePath = await createVectorStore(paperText, projectId);
  console.log(`[${projectId}] Vector store created at: ${vectorStorePath}`);

  // Step 2: Generate summaries, diagrams, etc. (can still use direct SDK for speed)
  console.log(`[${projectId}] Generating AI analysis...`);
  const analysisData = await generateAnalysis(paperText);
  console.log(`[${projectId}] AI analysis generated.`);

  // Step 3: Return all data to be saved to the database
  return {
    ...analysisData,
    vectorStorePath: vectorStorePath,
    status: 'complete',
  };
}

// --- Part 2: Create the Vector Store (The RAG Core)---
async function createVectorStore(paperText: string, projectId: string) {
  console.log(`[${projectId}] Splitting text...`);
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([paperText]);
  console.log(`[${projectId}] Text split into ${docs.length} documents.`);
  
  console.log(`[${projectId}] Creating FaissStore...`);
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
  console.log(`[${projectId}] FaissStore created.`);
  
  const directory = `./vector_stores/${projectId}`;
  await fs.mkdir(directory, { recursive: true });
  console.log(`[${projectId}] Saving vector store to ${directory}...`);
  await vectorStore.save(directory);
  console.log(`[${projectId}] Vector store saved.`);
  
  return directory;
}

async function generateAnalysis(paperText: string) {
    console.log("Generating analysis...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Helper function to clean AI responses
    const cleanResponse = (text: string) => {
      return text
        .replace(/```json\n?/g, '') // Remove JSON code block start
        .replace(/```\n?/g, '') // Remove code block end
        .replace(/^```/g, '') // Remove leading ```
        .replace(/```$/g, '') // Remove trailing ```
        .trim();
    };

    // 1. First pass: Extract key terms for web search
    console.log("Extracting key terms...");
    const keyTermsPrompt = `Analyze the following research paper and extract the 5 most important technical terms or concepts that would need further explanation for a college student. Return ONLY a JSON array of strings. Example: ["Convolutional Neural Network", "Backpropagation"]. If no terms are found, return an empty array.

RESEARCH PAPER TEXT:
${paperText.substring(0, 10000)}`;

    const keyTermsResult = await model.generateContent(keyTermsPrompt);
    const cleanedKeyTermsResponse = cleanResponse(keyTermsResult.response.text() || '[]');
    const keyTerms: string[] = JSON.parse(cleanedKeyTermsResponse);
    console.log("Key terms extracted:", keyTerms);

    // 2. Second pass: Use Tavily to get external context
    console.log("Fetching external context...");
    const tavily = new TavilySearchResults({apiKey: process.env.TAVILY_API_KEY!});
    const searchResults = await Promise.all(
      keyTerms.map(term => tavily.invoke(term))
    );
    const externalContext = searchResults.map((res, i) => ({
      term: keyTerms[i],
      definition: res[0].content,
      source: res[0].url,
    }));
    console.log("External context fetched.");

    // 3. Third pass: Generate all content in parallel with enriched context
    console.log("Generating content in parallel...");
    const contextForGeneration = `
      CONTEXT: 
      ${externalContext.map(ctx => `Term: ${ctx.term}\nDefinition: ${ctx.definition}\n`).join('\n')}
      
      RESEARCH PAPER:
      ${paperText.substring(0, 15000)}
    `;

    const eli5Prompt = `Summarize the RESEARCH PAPER for a five-year-old (ELI5), using the CONTEXT provided for clarification. Keep it simple and engaging.`;
    const collegePrompt = `Summarize the RESEARCH PAPER for a college student, using the CONTEXT provided for clarification. Include key concepts and findings.`;
    const expertPrompt = `Summarize the RESEARCH PAPER for a domain expert, using the CONTEXT provided for clarification. Focus on technical details and implications.`;
    const entitiesPrompt = `Extract key code snippets and references from the RESEARCH PAPER. Return ONLY a JSON object with two keys: "codeSnippets": [{ "description": string, "code": string }[]] and "references": [{ "title": string, "url": string }[]]. If none are found, return empty arrays.

RESEARCH PAPER TEXT:
${paperText.substring(0, 10000)}`;
    const diagramPrompt = `Create a Mermaid.js flowchart that visualizes the core methodology or workflow described in the RESEARCH PAPER. Return ONLY the Mermaid syntax in a single code block. If no clear workflow is present, return an empty string.

RESEARCH PAPER TEXT:
${paperText.substring(0, 8000)}`;

    const [
      summaryEli5,
      summaryCollege,
      summaryExpert,
      entitiesResult,
      diagramSyntax,
    ] = await Promise.all([
      model.generateContent(eli5Prompt),
      model.generateContent(collegePrompt),
      model.generateContent(expertPrompt),
      model.generateContent(entitiesPrompt),
      model.generateContent(diagramPrompt),
    ]);
    console.log("Content generation complete.");

    const cleanedEntitiesResponse = cleanResponse(entitiesResult.response.text() || '{}');
    let entities;
    try {
      entities = JSON.parse(cleanedEntitiesResponse);
    } catch (error) {
      console.log("Failed to parse entities JSON, using fallback:", error);
      console.log("Raw response:", entitiesResult.response.text());
      entities = { codeSnippets: [], references: [] };
    }

    return {
      summaryEli5: summaryEli5.response.text(),
      summaryCollege: summaryCollege.response.text(),
      summaryExpert: summaryExpert.response.text(),
      extractedCodeSnippets: entities.codeSnippets || [],
      extractedReferences: entities.references || [],
      keyTerms: externalContext,
      diagramSyntax: diagramSyntax.response.text().replace(/```mermaid\n|```/g, "").trim(),
    };
  }

