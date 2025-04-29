"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = () => {
    setError(true);
    setIsLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-[#FAF9F6] dark:bg-[#262625] border border-[#E3DACC] dark:border-[#BFB8AC]/30 rounded-lg overflow-hidden",
        className
      )}
    >
      {/* PDF Controls */}
      <div className="w-full flex items-center justify-between p-2 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1 || isLoading}
            className="h-8 w-8 rounded-full border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#262625] dark:text-[#FAF9F6]">
            {pageNumber} / {numPages || "?"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={
              pageNumber >= (numPages || Number.MAX_SAFE_INTEGER) || isLoading
            }
            className="h-8 w-8 rounded-full border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
          >
            <Download className="h-3 w-3" />
            <span className="text-xs">Download</span>
          </Button>
        </a>
      </div>

      {/* PDF Document */}
      <div className="w-full overflow-auto flex-1 p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-[#C96442] animate-spin mb-2" />
            <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
              Loading PDF...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-red-500 mb-2">
              Error loading PDF. Please try again.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C96442] hover:underline text-sm"
            >
              Open in new tab
            </a>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-md"
            scale={1.2}
          />
        </Document>
      </div>
    </div>
  );
} 