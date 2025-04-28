"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  signInWithEmail, 
  signInWithGoogle, 
  signUpWithEmail, 
  type SignInInput, 
  type SignUpInput 
} from "@/lib/auth-client";
import { signInSchema, signUpSchema } from "@/lib/validator";

// Sign-in form component
function SignInForm({ onGoogleSignIn, googleLoading }: { onGoogleSignIn: () => Promise<void>, googleLoading: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: SignInInput) => {
        setLoading(true);
        try {
            const result = await signInWithEmail(data);
            if (result.success) {
                toast.success("Successfully signed in!");
                router.push('/dashboard');
            } else {
                toast.error(result.error || "Failed to sign in");
            }
        } catch (error) {
            toast.error("Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#C96442] ${
                            errors.email ? 'border-red-500' : 'border-[#E3DACC]'
                        }`}
                        placeholder="Enter your email"
                        disabled={loading || googleLoading}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Password
                        </label>
                        <Link href="/auth/forgot-password" className="text-xs text-[#C96442] hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        {...register("password")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#C96442] ${
                            errors.password ? 'border-red-500' : 'border-[#E3DACC]'
                        }`}
                        placeholder="Enter your password"
                        disabled={loading || googleLoading}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>
                
                <button 
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 bg-[#C96442] text-white rounded-md hover:bg-[#C96442]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="mt-6">
                <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-[#E3DACC]"></div>
                    <span className="px-4 text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 border-t border-[#E3DACC]"></div>
                </div>
                
                <button
                    type="button"
                    onClick={onGoogleSignIn}
                    disabled={loading || googleLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E3DACC] rounded-md hover:bg-[#E3DACC]/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    Continue with Google
                </button>
                
                <p className="text-center text-sm mt-4">
                    Don't have an account?{" "}
                    <Link href="/auth/sign-up" className="text-[#C96442] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </>
    );
}

// Sign-up form component
function SignUpForm({ onGoogleSignIn, googleLoading }: { onGoogleSignIn: () => Promise<void>, googleLoading: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: SignUpInput) => {
        setLoading(true);
        try {
            const result = await signUpWithEmail(data);
            if (result.success) {
                toast.success("Account created successfully!");
                router.push('/dashboard');
            } else {
                toast.error(result.error || "Failed to create account");
            }
        } catch (error) {
            toast.error("Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-6">
                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        {...register("username")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#C96442] ${
                            errors.username ? 'border-red-500' : 'border-[#E3DACC]'
                        }`}
                        placeholder="Enter your username"
                        disabled={loading || googleLoading}
                    />
                    {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#C96442] ${
                            errors.email ? 'border-red-500' : 'border-[#E3DACC]'
                        }`}
                        placeholder="Enter your email"
                        disabled={loading || googleLoading}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register("password")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#C96442] ${
                            errors.password ? 'border-red-500' : 'border-[#E3DACC]'
                        }`}
                        placeholder="Enter your password"
                        disabled={loading || googleLoading}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>
                
                <button 
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 bg-[#C96442] text-white rounded-md hover:bg-[#C96442]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating account..." : "Sign Up"}
                </button>
            </form>

            <div className="mt-6">
                <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-[#E3DACC]"></div>
                    <span className="px-4 text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 border-t border-[#E3DACC]"></div>
                </div>
                
                <button
                    type="button"
                    onClick={onGoogleSignIn}
                    disabled={loading || googleLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E3DACC] rounded-md hover:bg-[#E3DACC]/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    Continue with Google
                </button>
                
                <p className="text-center text-sm mt-4">
                    Already have an account?{" "}
                    <Link href="/auth/sign-in" className="text-[#C96442] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </>
    );
}

// Main AuthView component
export function AuthView({ pathname }: { pathname: string }) {
    const isSignIn = pathname === "sign-in";
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // Check for existing session on mount and redirect if logged in
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedSession = localStorage.getItem('user-session');
            if (storedSession) {
                try {
                    const session = JSON.parse(storedSession);
                    if (session && session.isAuthenticated) {
                        console.log("User already logged in, redirecting to dashboard");
                        router.push('/dashboard');
                    }
                } catch (error) {
                    console.error("Error parsing stored session:", error);
                }
            }
        }
    }, [router]);
    
    // Check for error query param on load
    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            // Google OAuth will redirect, so we don't need to handle the result
            await signInWithGoogle();
            // The following code won't execute due to redirect
        } catch (error) {
            console.error("Google sign in error:", error);
            setIsLoading(false);
            toast.error("Failed to sign in with Google");
        }
    };

    // If we're on the sign-in page, check for error query param
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const error = url.searchParams.get('error');
            
            if (error) {
                console.error("OAuth error:", error);
                const errorMessages: Record<string, string> = {
                    'missing_code': 'Authentication code missing',
                    'token_exchange': 'Failed to authenticate with Google',
                    'user_profile': 'Failed to fetch your Google profile',
                    'unknown': 'An unknown error occurred',
                };
                
                toast.error(errorMessages[error] || 'Failed to sign in with Google');
                
                // Clean the URL
                url.searchParams.delete('error');
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, []);

    return (
        <main className="flex grow flex-col items-center justify-center gap-4 p-4 bg-[#FAF9F6] dark:bg-[#262625]">
            <div className="w-full max-w-md mx-auto px-8 py-12 rounded-lg bg-white dark:bg-[#1A1A1A] shadow-sm">
                <div className="flex justify-center mb-6">
                    <Link href="/">
                        <div className="flex items-baseline">
                            <span className="font-[family-name:var(--font-instrument-serif)] text-2xl font-bold text-[#C96442]">REM</span>
                        </div>
                    </Link>
                </div>
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-[family-name:var(--font-instrument-serif)] mb-2">
                        {isSignIn ? "Welcome back" : "Create an account"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSignIn 
                            ? "Sign in to access your personalized research experience" 
                            : "Join Rem to make research accessible and personalized"}
                    </p>
                </div>
                
                {isSignIn ? (
                    <SignInForm onGoogleSignIn={handleGoogleSignIn} googleLoading={isLoading} />
                ) : (
                    <SignUpForm onGoogleSignIn={handleGoogleSignIn} googleLoading={isLoading} />
                )}
            </div>

            <p className="text-muted-foreground text-xs mt-4">
                By using Rem, you agree to our{" "}
                <Link href="/terms" className="text-[#C96442] hover:underline">
                    Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#C96442] hover:underline">
                    Privacy Policy
                </Link>
            </p>
        </main>
    );
} 