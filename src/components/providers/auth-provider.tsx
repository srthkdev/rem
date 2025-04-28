"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { authClient } from "@/lib/auth-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setIsLoading } = useAuthStore();

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
                            if (sessionData && sessionData.isAuthenticated) {
                                console.log("AuthProvider: Found authenticated session in localStorage");
                                setUser({
                                    id: sessionData.id,
                                    email: sessionData.email,
                                    name: sessionData.name,
                                    image: sessionData.image,
                                });
                                
                                // No need to continue with other auth checks
                                setIsLoading(false);
                                return;
                            }
                        } catch (error) {
                            console.error("AuthProvider: Error parsing stored session:", error);
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