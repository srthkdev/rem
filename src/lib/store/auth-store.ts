import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/auth-client'

type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,
            isAuthenticated: false,
            setUser: (user) => set({ 
                user, 
                isAuthenticated: !!user 
            }),
            setIsLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ 
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
) 