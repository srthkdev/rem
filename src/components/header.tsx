"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import Image from "next/image";

export function Header() {
    const pathname = usePathname();
    const [session, setSession] = useState<{ email: string; name: string; isAuthenticated: boolean; picture?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSession = localStorage.getItem('user-session');
            if (storedSession) {
                setSession(JSON.parse(storedSession));
            }
        } catch (error) {
            console.error("Error loading session:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out with auth client:", error);
        }
        localStorage.removeItem('user-session');
        setSession(null);
        toast.success("Successfully signed out");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <Link href="/" className="font-[family-name:var(--font-instrument-serif)] mr-8 text-2xl text-[#C96442]">
                    <div className="px-4 flex items-baseline">
                        <span className="font-bold">REM</span>
                    </div>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link
                        href="/"
                        className={cn(
                            "transition-colors hover:text-foreground/80 relative group",
                            pathname === "/" ? "text-foreground" : "text-foreground/60"
                        )}
                    >
                        Home
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#C96442] transform scale-x-0 transition-transform group-hover:scale-x-100" />
                    </Link>
                    <Link
                        href="/explore"
                        className={cn(
                            "transition-colors hover:text-foreground/80 relative group",
                            pathname?.startsWith("/explore") ? "text-foreground" : "text-foreground/60"
                        )}
                    >
                        Explore
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#C96442] transform scale-x-0 transition-transform group-hover:scale-x-100" />
                    </Link>
                    <Link
                        href="/about"
                        className={cn(
                            "transition-colors hover:text-foreground/80 relative group",
                            pathname?.startsWith("/about") ? "text-foreground" : "text-foreground/60"
                        )}
                    >
                        About
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#C96442] transform scale-x-0 transition-transform group-hover:scale-x-100" />
                    </Link>
                    {session && session.isAuthenticated && (
                        <Link
                            href="/dashboard"
                            className={cn(
                                "transition-colors hover:text-foreground/80 relative group",
                                pathname?.startsWith("/dashboard") ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Dashboard
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#C96442] transform scale-x-0 transition-transform group-hover:scale-x-100" />
                        </Link>
                    )}
                </nav>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        {!loading && (
                            <>
                                {!session || !session.isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/auth/sign-in"
                                            className={cn(
                                                buttonVariants({ variant: "ghost", size: "sm" }),
                                                "px-4 hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/sign-up"
                                            className={cn(
                                                buttonVariants({ size: "sm" }),
                                                "bg-[#C96442] hover:bg-[#C96442]/90 px-4"
                                            )}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        {session.picture ? (
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                <Image
                                                    src={session.picture}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] font-medium">
                                                {(session.name || session.email).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleSignOut}
                                            className={cn(
                                                buttonVariants({ variant: "ghost", size: "sm" }),
                                                "px-4 hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
