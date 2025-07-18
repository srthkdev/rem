"use client";

import { type ReactNode, useRef } from "react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PDFProvider } from "@/lib/pdf-context";

export function Providers({ children }: { children: ReactNode }) {
  const queryClientRef = useRef<QueryClient>(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <PDFProvider>
        {children}
        <Toaster position="top-center" />
        <ReactQueryDevtools initialIsOpen={false} />
      </PDFProvider>
    </QueryClientProvider>
  );
}
