"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { IntroducingRemAI } from "@/components/introducing-rem-ai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
    const [sessionStatus, setSessionStatus] = useState("loading");
    
    useEffect(() => {
        // Only log session status on client-side
        console.log("Auth status:", sessionStatus);
    }, [sessionStatus]);

    const placeholders = [
        "What's the latest research on climate change?",
        "Explain quantum computing to a beginner",
        "Find papers about renewable energy solutions",
        "Summarize recent advances in machine learning",
        "Help me understand neural networks in simple terms",
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };
    
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submitted");
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="px-4 pt-16 pb-8 max-w-7xl mx-auto w-full relative">
                <IntroducingRemAI />
                
                <div className="flex flex-col items-center justify-center mt-16 mb-12">
                    <div className="flex items-baseline">
                        
                        <h1 className="font-[family-name:var(--font-instrument-serif)] text-7xl md:text-9xl font-bold text-[#C96442]">REM</h1>
                    </div>
                    <p className="text-xl md:text-2xl font-[family-name:var(--font-work-sans)] font-medium text-black dark:text-white -mt-1">Research Made Accessible</p>
                </div>

                <div className="max-w-3xl mx-auto mt-10 mb-12">
                    <div className="relative">
                        <PlaceholdersAndVanishInput
                            placeholders={placeholders}
                            onChange={handleChange}
                            onSubmit={onSubmit}
                        />
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <p className="text-sm text-neutral-400">
                            Powered by AI • 1M+ papers • Personalized learning
                        </p>
                    </div>
                </div>

                {/* Pixelated R Box */}
                <div className="absolute left-0 top-1/2 -translate-y-1/3 lg:block hidden">
                    <div className="w-[300px] h-[300px] relative">
                        <div className="absolute inset-0">
                            {/* Pixelated pattern - 15x15 grid */}
                            {Array.from({ length: 225 }).map((_, i) => {
                                const x = i % 15;
                                const y = Math.floor(i / 15);
                                
                                // Define the R shape pattern
                                const isPartOfR = (
                                    // Vertical stem
                                    (x >= 2 && x <= 4 && y >= 2 && y <= 12) ||
                                    // Top horizontal
                                    (x >= 2 && x <= 8 && y >= 2 && y <= 4) ||
                                    // Middle horizontal
                                    (x >= 2 && x <= 8 && y >= 6 && y <= 8) ||
                                    // Curve/Diagonal
                                    (x >= 6 && x <= 8 && y >= 4 && y <= 6) ||
                                    (x >= 6 && x <= 8 && y >= 8 && y <= 10) ||
                                    (x >= 8 && x <= 10 && y >= 10 && y <= 12)
                                );

                                return isPartOfR ? (
                                    <div
                                        key={i}
                                        className="absolute w-[6.66%] h-[6.66%] bg-[#C96442]/20"
                                        style={{
                                            left: `${(i % 15) * 6.66}%`,
                                            top: `${Math.floor(i / 15) * 6.66}%`
                                        }}
                                    />
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Half Page Separator Line */}
            <div className="w-1/2 ml-auto border-t border-[#E3DACC]"></div>

            {/* Features Section */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-normal text-center mb-16">How Rem Works</h2>
                
                <div className="grid md:grid-cols-3 gap-10">
                    <div className="bg-background p-8 rounded-md border border-[#E3DACC] shadow-sm">
                        <div className="mb-4 text-[#C96442] text-2xl">01</div>
                        <h3 className="text-2xl mb-4">Discover Research Effortlessly</h3>
                        <p className="text-lg text-muted-foreground">
                            Tell Rem your interests, choose your background level, and get personalized paper recommendations.
                        </p>
                    </div>
                    
                    <div className="bg-background p-8 rounded-md border border-[#E3DACC] shadow-sm">
                        <div className="mb-4 text-[#C96442] text-2xl">02</div>
                        <h3 className="text-2xl mb-4">Consume Research Your Way</h3>
                        <p className="text-lg text-muted-foreground">
                            Read simplified explanations, listen to AI-generated podcasts, or explore visual concept maps.
                        </p>
                    </div>
                    
                    <div className="bg-background p-8 rounded-md border border-[#E3DACC] shadow-sm">
                        <div className="mb-4 text-[#C96442] text-2xl">03</div>
                        <h3 className="text-2xl mb-4">Interact and Learn</h3>
                        <p className="text-lg text-muted-foreground">
                            Ask questions about any concept and get personalized examples tailored to your background.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[#C96442] text-[#FAF9F6] py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-normal mb-8">
                        Ready to Make Research Accessible?
                    </h2>
                    <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                        Join Rem today and transform how you consume research, making it accessible regardless of your background.
                    </p>
                    <Link href="/auth/sign-up">
                        <button className="px-10 py-4 bg-[#FAF9F6] text-[#C96442] rounded-md hover:bg-[#FAF9F6]/90 transition-colors text-lg">
                            Get Started Now
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-4 border-t border-[#E3DACC]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <span className="font-[family-name:var(--font-instrument-serif)] text-2xl font-medium text-[#C96442]">
                            Rem
                        </span>
                        <p className="text-base text-muted-foreground mt-2">
                            Research Made Accessible
                        </p>
                    </div>
                    
                    <nav className="flex gap-8">
                        <Link href="/about" className="text-base text-muted-foreground hover:text-[#C96442]">
                            About
                        </Link>
                        <Link href="/privacy" className="text-base text-muted-foreground hover:text-[#C96442]">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-base text-muted-foreground hover:text-[#C96442]">
                            Terms
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
