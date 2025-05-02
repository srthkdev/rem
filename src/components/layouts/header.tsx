"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSignOut } from "@/hooks/auth-hooks";

export function Header() {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const signOut = useSignOut();

    // Redirect to appropriate pages based on auth state
    useEffect(() => {
        if (!isLoading) {
            const currentPath = window.location.pathname;
            
            // Handle authenticated users
            if (isAuthenticated) {
                // If on landing page, redirect to project/new
                if (currentPath === '/') {
                    console.log("Header: Authenticated user on landing page, redirecting to project/new");
                    router.push('/project/new');
                }
            } 
            // Handle unauthenticated users
            else {
                const protectedPaths = ['/project', '/dashboard', '/settings', '/profile'];
                
                // Check if the current path is a protected route
                const isProtectedRoute = protectedPaths.some(path => 
                    currentPath === path || currentPath.startsWith(`${path}/`)
                );
                
                if (isProtectedRoute) {
                    console.log("Header: Not authenticated but on protected route, redirecting to sign-in");
                    router.push('/auth/sign-in');
                }
            }
        }
    }, [isAuthenticated, isLoading, router]);

    // If user doesn't have an image, try to get one from Gravatar
    useEffect(() => {
        if (user?.email && !user?.image) {
            // Generate MD5 hash for Gravatar
            const emailMd5 = user.email.trim().toLowerCase();
            // In browser environment we can't use Node.js crypto directly, so using a simple approach
            // In production, consider using a proper MD5 library or server-side generation
            const hash = Array.from(emailMd5).reduce((acc, char) => 
                acc + char.charCodeAt(0).toString(16), '');
            
            // Use Gravatar with a default to UI Avatars
            const name = user.name || user.email.split('@')[0];
            const encodedName = encodeURIComponent(name);
            const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=c96442&color=fff`;
            
            // Set Gravatar with UI Avatars as fallback
            setProfileImage(`https://www.gravatar.com/avatar/${hash}?d=${encodeURIComponent(uiAvatarUrl)}`);
        } else if (user?.image) {
            setProfileImage(user.image);
        } else {
            setProfileImage(null);
        }
    }, [user]);

    const handleSignOut = () => {
        signOut.mutate();
    };

    // Function to get initials from name or email
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
                {/* Logo - Left Aligned */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-baseline mr-4">
                        <span className="font-[family-name:var(--font-work-sans)] text-2xl font-bold text-[#C96442]">REM</span>
                    </Link>
                </div>

                {/* Navigation Links - Center Aligned */}
                <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
                    <Link href="/" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#C96442] after:transition-all after:duration-300 hover:after:w-full hover:text-[#C96442]">
                        Home
                    </Link>
                    <Link href="/explore" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#C96442] after:transition-all after:duration-300 hover:after:w-full hover:text-[#C96442]">
                        Explore
                    </Link>
                    <Link href="/about" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#C96442] after:transition-all after:duration-300 hover:after:w-full hover:text-[#C96442]">
                        About
                    </Link>
                </nav>

                {/* Auth Buttons - Right Aligned */}
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                    ) : isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                {profileImage ? (
                                    <img 
                                        src={profileImage} 
                                        alt="Profile" 
                                        className="w-9 h-9 rounded-full object-cover cursor-pointer"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-[#C96442] flex items-center justify-center text-white text-xs font-medium cursor-pointer">
                                        {user?.name ? getInitials(user.name) : user?.email ? getInitials(user.email.split('@')[0]) : "U"}
                                    </div>
                                )}
                                
                                <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-[#FAF9F6] dark:bg-[#262625] border border-[#E3DACC] dark:border-[#BFB8AC]/30 shadow-lg rounded-md p-2 min-w-32 z-50">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-2 py-1 text-sm text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10 rounded"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/auth/sign-in"
                                className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#C96442] after:transition-all after:duration-300 hover:after:w-full hover:text-[#C96442]"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/sign-up"
                                className="inline-flex h-9 items-center justify-center rounded-md bg-[#C96442] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#C96442]/90 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
