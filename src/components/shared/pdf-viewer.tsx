"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { usePDFContext } from "@/lib/pdf-context";

// Loading component to show while the PDF viewer is loading
const PDFLoading = () => (
  <div className="h-full flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full mb-4"></div>
      <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">Loading PDF viewer...</p>
    </div>
  </div>
);

// Dynamically import react-pdf components with force SSR off
const PDFDocument = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { 
    ssr: false,
    loading: () => <PDFLoading />
  }
);

const PDFPage = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

interface PDFViewerProps {
  url: string;
  className?: string;
  onFallbackRequest?: () => void;
}

export function PDFViewer({ url, className, onFallbackRequest }: PDFViewerProps) {
  const { initialized } = usePDFContext();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Log PDFjs version for debugging
  useEffect(() => {
    console.log("Using PDF.js version:", (window as any).pdfjs?.version || "unknown");
  }, []);

  // Handle container resize to adjust page width
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current) {
        // Calculate available width accounting for padding
        const containerWidth = containerRef.current.clientWidth;
        // Use almost full container width with a tiny padding
        // and ensure minimum and maximum reasonable constraints
        setContainerWidth(Math.min(Math.max(containerWidth - 10, 280), 2000));
      }
    };
    
    // Call initially and set up observer
    handleResize();
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(handleResize);
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setError(null);
    setLoading(true);
  }, [url]);

  // If PDF context isn't initialized yet, show loading
  if (!initialized) {
    return <PDFLoading />;
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log(`PDF loaded successfully with ${numPages} pages`);
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    console.error("PDF loading error:", err);
    setError(err);
    setLoading(false);
  }

  function previousPage() {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  }

  function nextPage() {
    setPageNumber(prevPageNumber => 
      numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber
    );
  }

  function zoomIn() {
    setScale(prevScale => Math.min(2.5, prevScale + 0.1));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(0.5, prevScale - 0.1));
  }

  function openPDFExternally() {
    window.open(url, '_blank');
  }

  function retryLoading() {
    setError(null);
    setLoading(true);
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden project-pdf-container" ref={containerRef}>
      <div className="flex items-center justify-between p-2 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30 flex-shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1 || loading || Boolean(error)}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {pageNumber} / {numPages || "?"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages || loading || Boolean(error)}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={loading || Boolean(error)}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={loading || Boolean(error)}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={error ? retryLoading : openPDFExternally}
            className="h-8 w-8 p-0 ml-2"
            title={error ? "Retry loading" : "Open in new tab"}
          >
            {error ? <RefreshCcw className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-grow flex justify-center items-center bg-[#f8f9fa] dark:bg-[#1e1e1e] overflow-hidden" style={{ flexBasis: '100%' }}>
        {error ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <p className="text-red-500 mb-2 font-medium">Unable to load PDF</p>
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-4">
                {error.message || "There was a problem loading the PDF document."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={retryLoading}
                >
                  Try again
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={openPDFExternally}
                  className="bg-[#C96442] hover:bg-[#C96442]/90"
                >
                  Open in browser
                </Button>
                {onFallbackRequest && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onFallbackRequest}
                  >
                    Use direct view
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center overflow-hidden">
            {loading && <PDFLoading />}
            
            <div className={loading ? "hidden" : "pdf-container w-full h-full"}>
              <PDFDocument
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                externalLinkTarget="_blank"
                className="pdf-document flex-1"
                loading={<PDFLoading />}
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                  cMapPacked: true,
                  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
                }}
              >
                <PDFPage 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg mx-auto"
                  width={containerWidth}
                  canvasBackground="#ffffff"
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
                    </div>
                  }
                />
              </PDFDocument>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 