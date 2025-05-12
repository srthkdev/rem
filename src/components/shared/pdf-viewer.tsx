"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  RefreshCcw,
  Highlighter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { usePDFContext } from "@/lib/pdf-context";

// Styles for text highlighting
const textLayerStyles = `
  .react-pdf__Page__textContent {
    cursor: text !important;
    user-select: text !important;
    z-index: 10 !important;
    opacity: 1 !important;
  }
  .react-pdf__Page__textContent span {
    opacity: 0.2 !important;
    color: black !important;
    cursor: text !important;
  }
  .react-pdf__Page__textContent span::selection,
  .react-pdf__Page__textContent::selection {
    background-color: rgba(201, 100, 66, 0.4) !important;
    color: black !important;
  }
  .highlighted-text {
    background-color: rgba(201, 100, 66, 0.4) !important;
    padding: 2px 0;
    border-radius: 2px;
    position: relative;
    z-index: 2;
    color: black !important;
  }
  
  .pdf-highlight-container {
    position: absolute;
    pointer-events: none;
    z-index: 20;
  }
  
  .pdf-highlight {
    background-color: rgba(201, 100, 66, 0.4);
    position: absolute;
    border-radius: 2px;
    transition: opacity 200ms ease;
    box-shadow: 0 0 4px rgba(201, 100, 66, 0.6);
  }
  
  .pdf-highlight:hover {
    opacity: 0.7;
  }
`;

// Loading component to show while the PDF viewer is loading
const PDFLoading = () => (
  <div className="h-full flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full mb-4"></div>
      <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
        Loading PDF viewer...
      </p>
    </div>
  </div>
);

// Dynamically import react-pdf components with force SSR off
const PDFDocument = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  {
    ssr: false,
    loading: () => <PDFLoading />,
  },
);

const PDFPage = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

interface PDFViewerProps {
  url: string;
  className?: string;
  onFallbackRequest?: () => void;
}

interface Highlight {
  id: string;
  content: string;
  position: {
    pageNumber: number;
    boundingRect: DOMRect;
  };
}

export function PDFViewer({
  url,
  className,
  onFallbackRequest,
}: PDFViewerProps) {
  const { initialized } = usePDFContext();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isHighlightingEnabled, setIsHighlightingEnabled] = useState(false);
  const highlightsContainerRef = useRef<HTMLDivElement>(null);

  // Add text layer styles
  useEffect(() => {
    // Add inline styles for more specificity
    const style = document.createElement("style");
    style.innerHTML = textLayerStyles;
    document.head.appendChild(style);

    // Enhance all text layers
    const enhanceTextLayers = () => {
      const textLayers = document.querySelectorAll(
        ".react-pdf__Page__textContent",
      );
      textLayers.forEach((layer) => {
        if (layer instanceof HTMLElement) {
          layer.style.opacity = "1";
          layer.style.userSelect = "text";
          layer.style.cursor = "text";
          layer.style.zIndex = "10";
        }
      });
    };

    // Run initially
    enhanceTextLayers();

    // Set up observer to enhance new text layers
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          // Wait a bit for React PDF to fully render
          setTimeout(enhanceTextLayers, 200);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  // Log PDFjs version for debugging
  useEffect(() => {
    console.log(
      "Using PDF.js version:",
      (window as unknown as { pdfjs?: { version?: string } }).pdfjs?.version ||
        "unknown",
    );
  }, []);

  // Handle container resize to adjust page width
  useEffect(() => {
    const container = containerRef.current;
    if (!containerRef.current) return;

    const handleResize = () => {
      if (container) {
        // Calculate available width accounting for padding
        const containerWidth = container.clientWidth;
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

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Handle text highlighting with improved visibility
  useEffect(() => {
    if (!isHighlightingEnabled) return;

    console.log("Highlight mode enabled, ready to highlight text selections");

    const handleHighlight = (e: Event) => {
      // Show visual feedback that highlighting is active
      if (containerRef.current) {
        containerRef.current.style.cursor = "text";
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (!text || text.length === 0) return;

        console.log("Highlighting text:", text.substring(0, 30));

        try {
          const range = selection?.getRangeAt(0);
          if (!range) return;

          const rects = range.getClientRects();
          if (!rects || rects.length === 0) return;

          // Create a new highlight for each rect in the range
          const newHighlights: Highlight[] = Array.from(rects).map((rect) => ({
            id: crypto.randomUUID(),
            content: text,
            position: {
              pageNumber,
              boundingRect: rect as DOMRect,
            },
          }));

          setHighlights((prev) => [...prev, ...newHighlights]);

          // Create visual highlights as overlay elements
          const pdfPage =
            containerRef.current?.querySelector(".react-pdf__Page");

          if (pdfPage && highlightsContainerRef.current) {
            const pdfRect = pdfPage.getBoundingClientRect();

            newHighlights.forEach((highlight) => {
              const rect = highlight.position.boundingRect;

              // Create highlight element
              const highlightEl = document.createElement("div");
              highlightEl.className = "pdf-highlight";
              highlightEl.dataset.highlightId = highlight.id;
              highlightEl.title = highlight.content;

              // Position relative to PDF container
              highlightEl.style.left = `${rect.left - pdfRect.left}px`;
              highlightEl.style.top = `${rect.top - pdfRect.top}px`;
              highlightEl.style.width = `${rect.width}px`;
              highlightEl.style.height = `${rect.height}px`;

              highlightsContainerRef.current?.appendChild(highlightEl);
            });

            // Add toast notification
            if (
              typeof window !== "undefined" &&
              (
                window as unknown as {
                  toast?: { success: (msg: string) => void };
                }
              ).toast
            ) {
              (
                window as unknown as {
                  toast?: { success: (msg: string) => void };
                }
              ).toast?.success("Text highlighted!");
            }
          }

          // Clear selection
          selection?.removeAllRanges();
        } catch (error) {
          console.error("Failed to highlight text:", error);
        }
      }, 100);
    };

    // Get text content layer
    const textLayer = containerRef.current?.querySelector(
      ".react-pdf__Page__textContent",
    );

    // Add highlight handler to text layer if it exists
    if (textLayer) {
      console.log("Adding highlight handler to text layer");
      textLayer.addEventListener("mouseup", handleHighlight);
    }

    // Otherwise add to document but filter for events within PDF container
    const documentHandler = (e: MouseEvent) => {
      if (
        e.target instanceof Element &&
        containerRef.current?.contains(e.target)
      ) {
        handleHighlight(e);
      }
    };

    document.addEventListener("mouseup", documentHandler);

    return () => {
      if (textLayer) {
        textLayer.removeEventListener(
          "mouseup",
          handleHighlight as unknown as EventListener,
        );
      }
      document.removeEventListener("mouseup", documentHandler);

      // Reset cursor
      if (containerRef.current) {
        containerRef.current.style.cursor = "default";
      }
    };
  }, [isHighlightingEnabled, pageNumber]);

  // Show a toast when highlighting is toggled
  useEffect(() => {
    if (isHighlightingEnabled) {
      // Check if we can show toast
      if (
        typeof window !== "undefined" &&
        (window as unknown as { toast?: { info: (msg: string) => void } }).toast
      ) {
        (
          window as unknown as { toast?: { info: (msg: string) => void } }
        ).toast?.info("Highlight mode activated. Select text to highlight.");
      }

      // Add visual class to container
      if (containerRef.current) {
        containerRef.current.classList.add("highlight-mode-active");
      }
    } else {
      // Remove visual class
      if (containerRef.current) {
        containerRef.current.classList.remove("highlight-mode-active");
      }
    }
  }, [isHighlightingEnabled]);

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
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  function nextPage() {
    setPageNumber((prevPageNumber) =>
      numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber,
    );
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(2.5, prevScale + 0.1));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(0.5, prevScale - 0.1));
  }

  function toggleHighlighting() {
    setIsHighlightingEnabled(!isHighlightingEnabled);
  }

  function openPDFExternally() {
    window.open(url, "_blank");
  }

  function retryLoading() {
    setError(null);
    setLoading(true);
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full overflow-hidden project-pdf-container",
        isHighlightingEnabled && "highlight-mode",
      )}
      ref={containerRef}
    >
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
            disabled={
              !numPages || pageNumber >= numPages || loading || Boolean(error)
            }
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
            variant={isHighlightingEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleHighlighting}
            disabled={loading || Boolean(error)}
            className={cn(
              "h-8 w-8 p-0 ml-2",
              isHighlightingEnabled && "bg-[#C96442] text-white",
            )}
            title={
              isHighlightingEnabled
                ? "Exit Highlight Mode"
                : "Enter Highlight Mode"
            }
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={error ? retryLoading : openPDFExternally}
            className="h-8 w-8 p-0 ml-2"
            title={error ? "Retry loading" : "Open in new tab"}
          >
            {error ? (
              <RefreshCcw className="h-4 w-4" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        className="flex-grow flex justify-center items-center bg-[#f8f9fa] dark:bg-[#1e1e1e] overflow-hidden"
        style={{ flexBasis: "100%" }}
      >
        {error ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <p className="text-red-500 mb-2 font-medium">
                Unable to load PDF
              </p>
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-4">
                {error.message ||
                  "There was a problem loading the PDF document."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={retryLoading}>
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
                    className="hover:!text-[#C96442] hover:!border-[#C96442] border-2"
                  >
                    Use direct view
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
            {loading && <PDFLoading />}

            <div
              className={
                loading ? "hidden" : "pdf-container w-full h-full relative"
              }
            >
              {/* Highlight container appears on top of the PDF */}
              <div
                className="pdf-highlight-container"
                ref={highlightsContainerRef}
                style={{
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  zIndex: 20,
                }}
              ></div>

              <PDFDocument
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                externalLinkTarget="_blank"
                className="pdf-document flex-1"
                loading={<PDFLoading />}
                options={{
                  cMapUrl: "https://unpkg.com/pdfjs-dist@3.4.120/cmaps/",
                  cMapPacked: true,
                  standardFontDataUrl:
                    "https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/",
                }}
              >
                <PDFPage
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg mx-auto relative"
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

      {isHighlightingEnabled && (
        <div className="py-2 px-3 text-sm bg-[#C96442]/10 text-[#C96442] font-medium flex items-center justify-center border-t border-[#C96442]/20">
          <Highlighter className="h-4 w-4 mr-2" /> Highlight Mode Active: Select
          text to highlight
        </div>
      )}
    </div>
  );
}
