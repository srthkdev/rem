import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import xml2js from "xml2js";
import { ArxivPaper } from "@/lib/store/project-store";

// Define minimal types for ArXiv XML parsing
interface ArxivCategory {
  $: {
    term: string;
  };
}
interface ArxivAuthor {
  name: string;
}
interface ArxivLink {
  $: {
    title?: string;
    rel?: string;
    href: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get the search query from URL parameters
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    const maxResults = url.searchParams.get("maxResults") || "10";

    console.log("ArXiv API Request:", { query, maxResults });

    // Validate the search query
    if (!query) {
      console.log("ArXiv API Error: No query provided");
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    // Construct the ArXiv API URL
    const arxivApiUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(
      query,
    )}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

    console.log("Calling ArXiv API URL:", arxivApiUrl);

    // Fetch data from ArXiv API
    const response = await axios.get(arxivApiUrl);
    const xmlData = response.data;

    console.log("ArXiv API Response received");

    // Parse XML to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    // Handle case where no entries are found
    if (!result.feed.entry) {
      console.log("ArXiv API: No entries found");
      return NextResponse.json({ papers: [] });
    }

    // Format the results
    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];

    console.log(`ArXiv API: Found ${entries.length} entries`);

    const papers: ArxivPaper[] = entries.map((entry: unknown) => {
      const e = entry as {
        category: ArxivCategory | ArxivCategory[];
        author: ArxivAuthor | ArxivAuthor[];
        link: ArxivLink | ArxivLink[];
        id: string;
        title: string;
        summary: string;
        published: string;
      };

      // Extract categories
      const categories = Array.isArray(e.category)
        ? e.category.map((cat: ArxivCategory) => cat.$.term)
        : [e.category.$.term];

      // Extract authors
      const authors = Array.isArray(e.author)
        ? e.author.map((author: ArxivAuthor) => author.name)
        : [e.author.name];

      // Extract PDF URL
      const pdfUrl = Array.isArray(e.link)
        ? e.link.find((link: ArxivLink) => link.$.title === "pdf")?.$.href || ""
        : "";

      // Extract ArXiv ID
      const idStr = e.id || "";
      const arxivId = idStr.split("/").pop() || "";

      return {
        id: arxivId,
        title: e.title.replace(/\n/g, " ").trim(),
        authors,
        summary: e.summary.replace(/\n/g, " ").trim(),
        publishedDate: new Date(e.published).toISOString(),
        pdfUrl,
        categories,
      };
    });

    return NextResponse.json({ papers });
  } catch (error) {
    console.error("Error processing ArXiv search:", error);
    return NextResponse.json(
      { error: "Failed to fetch results from ArXiv" },
      { status: 500 },
    );
  }
}
