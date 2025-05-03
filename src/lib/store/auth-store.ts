import { create } from "zustand";
import { User } from "@/lib/auth-client";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

// Remove useAuth export. Use useAuthStore directly in components as needed, e.g.:
// const user = useAuthStore(s => s.user)
// const isLoading = useAuthStore(s => s.isLoading)
// const isAuthenticated = useAuthStore(s => s.isAuthenticated)
