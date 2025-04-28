"use client";

import React from 'react';
export { AuthProvider } from './auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
} 