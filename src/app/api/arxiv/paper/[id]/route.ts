import axios from "axios";
import xml2js from "xml2js";
import { ArxivPaper } from "@/lib/store/project-store";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const id = segments[segments.length - 1];

    if (!id) {
      return Response.json({ error: "Paper ID is required" }, { status: 400 });
    }

    // Construct the ArXiv API URL for a specific paper
    const arxivApiUrl = `https://export.arxiv.org/api/query?id_list=${id}`;

    // Fetch data from ArXiv API
    const response = await axios.get(arxivApiUrl);
    const xmlData = response.data;

    // Parse XML to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    // Handle case where no entry is found
    if (!result.feed.entry) {
      return Response.json({ error: "Paper not found" }, { status: 404 });
    }

    // Format the entry
    const entry = result.feed.entry;

    // Extract categories
    const categories = Array.isArray(entry.category)
      ? entry.category.map((cat: ArxivCategory) => cat.$.term)
      : [entry.category.$.term];

    // Extract authors
    const authors = Array.isArray(entry.author)
      ? entry.author.map((author: ArxivAuthor) => author.name)
      : [entry.author.name];

    // Extract PDF URL
    const pdfUrl = Array.isArray(entry.link)
      ? entry.link.find((link: ArxivLink) => link.$.title === "pdf")?.$.href ||
        `https://arxiv.org/pdf/${id}.pdf`
      : `https://arxiv.org/pdf/${id}.pdf`;

    // Extract DOI if available
    const doiLink = Array.isArray(entry.link)
      ? entry.link.find(
          (link: ArxivLink) =>
            link.$.rel === "related" && link.$.href.includes("doi.org"),
        )
      : null;

    const doi = doiLink ? doiLink.$.href.split("doi.org/")[1] || "" : "";

    const paper: ArxivPaper = {
      id,
      title: entry.title.replace(/\n/g, " ").trim(),
      authors,
      summary: entry.summary.replace(/\n/g, " ").trim(),
      publishedDate: new Date(entry.published).toISOString(),
      pdfUrl,
      categories,
      doi: doi || undefined,
    };

    return Response.json({ paper });
  } catch (error) {
    console.error("Error fetching ArXiv paper:", error);
    return Response.json(
      { error: "Failed to fetch paper from ArXiv" },
      { status: 500 },
    );
  }
}
