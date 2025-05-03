"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

interface PDFContextType {
  initialized: boolean;
}

const PDFContext = createContext<PDFContextType>({
  initialized: false,
});

export function usePDFContext() {
  return useContext(PDFContext);
}

export function PDFProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  // Initialize the worker only once on the client side
  useEffect(() => {
    if (typeof window !== "undefined" && !initialized) {
      try {
        // Set the worker source directly to a CDN URL
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        setInitialized(true);
        console.log("PDF.js worker initialized successfully");
      } catch (error) {
        console.error("Failed to initialize PDF.js worker:", error);
      }
    }
  }, [initialized]);

  return (
    <PDFContext.Provider value={{ initialized }}>
      {children}
    </PDFContext.Provider>
  );
}
