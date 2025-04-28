"use client"

import { ThemeProvider } from "next-themes"
import { type ReactNode, useRef } from "react"
import { Toaster } from "sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

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
        })
    )

    return (
        <QueryClientProvider client={queryClientRef.current}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                themeColor={{
                    light: "#FAF9F6",
                    dark: "#262625"
                }}
            >
                {children}
                <Toaster position="top-center" />
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
