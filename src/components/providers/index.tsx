"use client";

import React from 'react';
import { QueryProvider } from './query-provider';
export { AuthProvider } from './auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            {children}
        </QueryProvider>
    );
} 