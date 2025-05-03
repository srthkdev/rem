"use client";

// Remove better-auth imports
// import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
// import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { useRouter } from "next/navigation"; // Keep router for now, might need later
import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "./auth-client";
import { useAuthStore } from "./store/auth-store";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter(); // Keep for now

  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const setUser = useAuthStore((s) => s.setUser);
  const setIsLoading = useAuthStore((s) => s.setIsLoading);

  useEffect(() => {
    setUser(data?.user ?? null);
    setIsLoading(isLoading);
  }, [data, isLoading, setUser, setIsLoading]);

  // Just render children, remove auth wrappers
  return <>{children}</>;
}
