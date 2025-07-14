

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { promises as fs } from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = new ChatGoogleGenerativeAI({ model: "gemini-1.5-pro-latest" });
const embeddings = new GoogleGenerativeAIEmbeddings();

// --- Part 1: The Processing Pipeline ---
export async function processAndStorePaper(projectId: string, paperText: string) {
  // Step 1: Create and save the Vector Store for RAG chat
  const vectorStorePath = await createVectorStore(paperText, projectId);

  // Step 2: Generate summaries, diagrams, etc. (can still use direct SDK for speed)
  const analysisData = await generateAnalysis(paperText);

  // Step 3: Return all data to be saved to the database
  return {
    ...analysisData,
    paperText,
    vectorStorePath: vectorStorePath,
    status: 'complete',
  };
}

// --- Part 2: Create the Vector Store (The RAG Core)---
async function createVectorStore(paperText: string, projectId: string) {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([paperText]);
  
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
  
  const directory = `./vector_stores/${projectId}`;
  await fs.mkdir(directory, { recursive: true });
  await vectorStore.save(directory);
  
  return directory;
}


async function generateAnalysis(paperText: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // 1. First pass: Extract key terms for web search
    const keyTermsPrompt = `Analyze the following research paper and extract the 5 most important technical terms or concepts that would need further explanation for a college student. Return ONLY a JSON array of strings. Example: ["Convolutional Neural Network", "Backpropagation"]. Text: ${paperText}`;
    const keyTermsResult = await model.generateContent(keyTermsPrompt);
    const keyTerms: string[] = JSON.parse(keyTermsResult.response.text());

    // 2. Second pass: Use Tavily to get external context
    const tavily = new TavilySearchResults({apiKey: process.env.TAVILY_API_KEY!});
    const searchResults = await Promise.all(
      keyTerms.map(term => tavily.invoke(term))
    );
    const externalContext = searchResults.map((res, i) => ({
      term: keyTerms[i],
      definition: res[0].content,
      source: res[0].url,
    }));

    // 3. Third pass: Generate all content in parallel with enriched context
    const contextForGeneration = `
      CONTEXT: 
      ${externalContext.map(ctx => `Term: ${ctx.term}\nDefinition: ${ctx.definition}\n`).join('\n')}
      
      RESEARCH PAPER:
      ${paperText}
    `;

    const eli5Prompt = `Summarize the RESEARCH PAPER for a five-year-old (ELI5), using the CONTEXT provided for clarification.`;
    const collegePrompt = `Summarize the RESEARCH PAPER for a college student, using the CONTEXT provided for clarification.`;
    const expertPrompt = `Summarize the RESEARCH PAPER for a domain expert, using the CONTEXT provided for clarification.`;
    const entitiesPrompt = `Extract key code snippets and references from the RESEARCH PAPER. Return ONLY a JSON object with two keys: "codeSnippets": [{ "description": string, "code": string }[]] and "references": [{ "title": string, "url": string }[]].`;
    const diagramPrompt = `Create a Mermaid.js flowchart that visualizes the core methodology or workflow described in the RESEARCH PAPER. Return ONLY the Mermaid syntax in a single code block.`;

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

    const entities = JSON.parse(entitiesResult.response.text());

    return {
      summaryEli5: summaryEli5.response.text(),
      summaryCollege: summaryCollege.response.text(),
      summaryExpert: summaryExpert.response.text(),
      extractedCodeSnippets: entities.codeSnippets,
      extractedReferences: entities.references,
      keyTerms: externalContext,
      diagramSyntax: diagramSyntax.response.text().replace(/```mermaid\n|```/g, "").trim(),
    };
  }

