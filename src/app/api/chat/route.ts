
import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req: NextRequest) {
  const { message, vectorStorePath } = await req.json();

  // 1. Load the model and the specific vector store for this paper
  const model = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash" });
  const embeddings = new GoogleGenerativeAIEmbeddings();
  const vectorStore = await FaissStore.load(vectorStorePath, embeddings);
  const retriever = vectorStore.asRetriever();

  // 2. Create the RAG Chain
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user's question based only on the following context:
    <context>{context}</context>
    Question: {input}
  `);
  const combineDocsChain = await createStuffDocumentsChain({ llm: model, prompt });
  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  // 3. Invoke the chain to get a contextual answer
  const result = await retrievalChain.invoke({ input: message });

  return NextResponse.json({ answer: result.answer });
}
