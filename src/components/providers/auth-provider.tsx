"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Detect and fix auth-state inconsistencies
    const detectBrokenAuth = async () => {
      try {
        // Check if we're on a protected route but shouldn't be
        const isProtectedRoute = [
          "/project",
          "/dashboard",
          "/settings",
          "/profile",
        ].some(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        );

        const isAuthRoute = [
          "/auth/sign-in",
          "/auth/sign-up",
          "/auth/reset-password",
        ].some((route) => pathname.startsWith(route));

        // Check if we're on the landing page
        const isLandingPage = pathname === "/";

        // If authenticated and on landing page or auth route, redirect to project/new
        if (isAuthenticated && (isLandingPage || isAuthRoute)) {
          console.log(
            "AuthProvider: Authenticated user on landing page or auth route, redirecting to /project/new",
          );
          router.push("/project/new");
          return;
        }

        // If we're trying to access protected pages while not authenticated,
        // the middleware should handle it. This is just a fallback.
        if (!isAuthenticated && isProtectedRoute) {
          // Let the middleware handle this - it should redirect appropriately
          console.log(
            "AuthProvider: Not authenticated but on protected route, letting middleware handle it",
          );
        }
      } catch (error) {
        console.error("AuthProvider: Error checking auth state:", error);
      }
    };

    detectBrokenAuth();
  }, [pathname, isAuthenticated, router]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);

        // First check localStorage for a session
        if (typeof window !== "undefined") {
          const storedSession = localStorage.getItem("user-session");
          if (storedSession) {
            try {
              const sessionData = JSON.parse(storedSession);
              if (
                sessionData &&
                sessionData.isAuthenticated &&
                sessionData.id &&
                sessionData.email
              ) {
                console.log(
                  "AuthProvider: Found authenticated session in localStorage",
                );
                setUser({
                  id: sessionData.id,
                  email: sessionData.email,
                  name: sessionData.name,
                  image: sessionData.image,
                });

                // No need to continue with other auth checks
                setIsLoading(false);
                return;
              } else {
                console.log(
                  "AuthProvider: Found invalid session in localStorage, clearing it",
                );
                localStorage.removeItem("user-session");
              }
            } catch (error) {
              console.error(
                "AuthProvider: Error parsing stored session:",
                error,
              );
              localStorage.removeItem("user-session"); // Clear invalid data
            }
          }
        }

        // No localStorage session found, try auth client
        console.log("AuthProvider: Checking with auth client");
        const { user } = await authClient.getSession();
        if (user) {
          console.log("AuthProvider: User found from auth client:", user);
          setUser(user);
        } else {
          console.log("AuthProvider: No user found");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthProvider: Failed to get session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}
