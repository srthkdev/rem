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

            </section>

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
        </div>
    );
}
