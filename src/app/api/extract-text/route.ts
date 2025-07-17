
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    console.log(`Fetching PDF from URL: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('URL does not point to a valid PDF file');
    }

    const buffer = await response.arrayBuffer();
    console.log(`PDF fetched successfully, size: ${buffer.byteLength} bytes`);

    // Use dynamic import to avoid issues with pdf-parse
    const pdfModule = await import('pdf-parse');
    const pdf = pdfModule.default;
    const data = await pdf(Buffer.from(buffer));
    
    console.log(`Text extraction successful, extracted ${data.text.length} characters`);
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        return NextResponse.json(
          { error: "PDF file not found or inaccessible" },
          { status: 404 }
        );
      }
      if (error.message.includes('Failed to fetch PDF')) {
        return NextResponse.json(
          { error: "Failed to download PDF from the provided URL" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
