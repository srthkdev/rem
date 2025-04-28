"use client";

// Remove better-auth imports
// import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
// import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { useRouter } from "next/navigation"; // Keep router for now, might need later
import { ReactNode } from "react";
import Link from "next/link"; // Keep Link for now

// Keep authClient import
import { authClient } from "./auth-client";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter(); // Keep for now
  
  // Just render children, remove auth wrappers
  return <>{children}</>;
} 