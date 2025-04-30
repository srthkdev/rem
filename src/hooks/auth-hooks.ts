"use client";

import { authClient, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SignInInput, SignUpInput } from "@/lib/validator";
import { useEffect, useState } from "react"
import type { User, Session } from "@/lib/auth-client"

// Constants for query keys
const AUTH_QUERY_KEYS = {
  SESSION: ['auth', 'session'],
};

/**
 * Hook for accessing and managing the current session
 */
export const useSession = () => {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Use React Query to fetch session data
  const { data, status, error } = useQuery({
    queryKey: AUTH_QUERY_KEYS.SESSION,
    queryFn: async () => {
      return await authClient.getSession();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isLoading, // Only fetch if we're still loading
  });

  // Return combined state from store and query
  return {
    user,
    data,
    status,
    error,
    isLoading,
    isAuthenticated,
    refresh: () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION }),
  };
};

/**
 * Hook for signing in with email/password
 */
export const useSignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const redirectTo = searchParams?.get('redirectTo') || '/project/new';

  return useMutation({
    mutationFn: async (data: SignInInput) => {
      return await signInWithEmail(data);
    },
    onSuccess: async (result) => {
      if (result.success) {
        // Refresh session
        const session = await authClient.getSession();
        if (session.user) {
          setUser(session.user);
          toast.success("Successfully signed in!");
          router.push(redirectTo);
        }
      } else {
        toast.error(result.error || "Failed to sign in");
      }
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
    },
  });
};

/**
 * Hook for signing up with email/password
 */
export const useSignUp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const redirectTo = searchParams?.get('redirectTo') || '/project/new';

  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      return await signUpWithEmail(data);
    },
    onSuccess: async (result) => {
      if (result.success) {
        // Refresh session
        const session = await authClient.getSession();
        if (session.user) {
          setUser(session.user);
          toast.success("Account created successfully!");
          router.push(redirectTo);
        }
      } else {
        toast.error(result.error || "Failed to create account");
      }
    },
    onError: (error) => {
      console.error("Sign up error:", error);
      toast.error("Failed to create account");
    },
  });
};

/**
 * Hook for signing in with Google
 */
export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return {
    signIn: handleGoogleSignIn,
    isLoading,
  };
};

/**
 * Hook for signing out
 */
export const useSignOut = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // First update store
      setUser(null);
      
      // Then call signOut API
      return await signOut();
    },
    onSuccess: async (result) => {
      if (result.success) {
        // Clear query cache
        queryClient.clear();
        
        // Ensure localStorage is cleared completely
        if (typeof window !== "undefined") {
          // Clear all auth-related items
          localStorage.removeItem("user-session");
          localStorage.removeItem("auth-storage");
          
          // Clear any potential cookies - using document.cookie
          document.cookie = "auth-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        
        // Wait a moment to ensure all state is cleared before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast.success("Signed out successfully");
        
        // Force a hard navigation to clear React Router state
        window.location.href = "/";
      } else {
        toast.error(result.error || "Failed to sign out");
      }
    },
    onError: (error) => {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    },
  });
};

/**
 * Hook for requiring authentication, with redirection
 */
export const useRequireAuth = (redirectTo = '/auth/sign-in') => {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to sign in page
      const signInPath = new URL(redirectTo, window.location.origin);
      signInPath.searchParams.set('redirectTo', window.location.pathname);
      router.push(signInPath.pathname + signInPath.search);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { user, isLoading, isAuthenticated };
};

// Create stub functions for all the other exports
export const usePrefetchSession = () => {}
export const useToken = () => null
export const useListAccounts = () => ({ data: [] })
export const useListSessions = () => ({ data: [] })
export const useListDeviceSessions = () => ({ data: [] })
export const useListPasskeys = () => ({ data: [] })
export const useUpdateUser = () => ({ mutate: async () => ({}) })
export const useUnlinkAccount = () => ({ mutate: async () => ({}) })
export const useRevokeOtherSessions = () => ({ mutate: async () => ({}) })
export const useRevokeSession = () => ({ mutate: async () => ({}) })
export const useRevokeSessions = () => ({ mutate: async () => ({}) })
export const useSetActiveSession = () => ({ mutate: async () => ({}) })
export const useRevokeDeviceSession = () => ({ mutate: async () => ({}) })
export const useDeletePasskey = () => ({ mutate: async () => ({}) })
export const useAuthQuery = () => ({});
export const useAuthMutation = () => ({});
