import axios from "axios";
import { ArxivPaper } from "@/lib/store/project-store";

// Base URL for ArXiv API
const ARXIV_API_URL = "https://export.arxiv.org/api/query";

// Function to convert XML response to JSON
const parseArxivResponse = (xmlString: string): ArxivPaper[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const entries = xmlDoc.getElementsByTagName("entry");
  
  const papers: ArxivPaper[] = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    // Extract paper details
    const id = entry.getElementsByTagName("id")[0]?.textContent?.trim() || "";
    const arxivId = id.split("/").pop() || "";
    const title = entry.getElementsByTagName("title")[0]?.textContent?.trim() || "";
    const summary = entry.getElementsByTagName("summary")[0]?.textContent?.trim() || "";
    const published = entry.getElementsByTagName("published")[0]?.textContent?.trim() || "";
    
    // Extract authors
    const authorElements = entry.getElementsByTagName("author");
    const authors: string[] = [];
    for (let j = 0; j < authorElements.length; j++) {
      const name = authorElements[j].getElementsByTagName("name")[0]?.textContent?.trim();
      if (name) authors.push(name);
    }
    
    // Extract categories
    const categoryElements = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "category");
    const categories: string[] = [];
    for (let j = 0; j < categoryElements.length; j++) {
      const term = categoryElements[j].getAttribute("term");
      if (term) categories.push(term);
    }
    
    // Extract DOI if available
    const links = entry.getElementsByTagName("link");
    let doi = "";
    for (let j = 0; j < links.length; j++) {
      const rel = links[j].getAttribute("rel");
      if (rel === "related") {
        const href = links[j].getAttribute("href") || "";
        if (href.includes("doi.org")) {
          doi = href.split("doi.org/")[1] || "";
        }
      }
    }
    
    // PDF URL
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    
    papers.push({
      id: arxivId,
      title,
      authors,
      summary,
      publishedDate: published,
      pdfUrl,
      categories,
      doi: doi || undefined,
    });
  }
  
  return papers;
};

/**
 * Search for ArXiv papers based on a query string
 * @param query The search query
 * @returns Promise containing ArXiv paper results
 */
export async function searchArxivPapers(query: string): Promise<ArxivPaper[]> {
  try {
    if (!query || query.trim().length < 3) {
      return [];
    }
    
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(`/api/arxiv/search?query=${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search ArXiv: ${response.statusText}`);
    }

    const data = await response.json();
    return data.papers;
  } catch (error) {
    console.error("Error searching ArXiv papers:", error);
    throw error;
  }
}

/**
 * Get a specific ArXiv paper by ID
 * @param id The ArXiv paper ID
 * @returns Promise containing the ArXiv paper
 */
export async function getArxivPaper(id: string): Promise<ArxivPaper> {
  try {
    const response = await fetch(`/api/arxiv/paper/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get ArXiv paper: ${response.statusText}`);
    }

    const data = await response.json();
    return data.paper;
  } catch (error) {
    console.error("Error fetching ArXiv paper:", error);
    throw error;
  }
} 