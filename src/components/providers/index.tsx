"use client";

import React from 'react';
import { ThemeProvider } from "next-themes";
import { QueryProvider } from './query-provider';
export { AuthProvider } from './auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                themes={["light", "dark", "system"]}
            >
                {children}
            </ThemeProvider>
        </QueryProvider>
    );
} 