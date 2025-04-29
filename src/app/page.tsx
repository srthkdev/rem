"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { IntroducingRemAI } from "@/components/introducing-rem-ai";
import { Header } from "@/components/header";
import { ArxivSearchInput } from "@/components/ui/arxiv-search-input";

const placeholders = [
    "Summarize the latest research on quantum computing...",
    "Help me understand the difference between supervised and unsupervised learning...",
    "What are the key findings in the paper 'Attention Is All You Need'?",
    "Explain the concept of transformer architecture in machine learning...",
    "What are the ethical implications of large language models?",
    "How has BERT changed natural language processing?",
    "Summarize recent advances in reinforcement learning...",
];

export default function Home() {
    const router = useRouter();
    const [value, setValue] = useState("");
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };
    
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!value.trim()) return;
        
        console.log("Submitted:", value);
        router.push("/dashboard");
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
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
                            <ArxivSearchInput />
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <p className="text-sm text-neutral-400">
                                Powered by AI • 1M+ papers • Personalized learning
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-12 px-4 bg-stone-50 dark:bg-stone-900">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm">
                                <h3 className="text-xl font-bold mb-3">Advanced Research</h3>
                                <p className="text-muted-foreground">Access millions of research papers with AI-powered search and insights.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm">
                                <h3 className="text-xl font-bold mb-3">Personalized Learning</h3>
                                <p className="text-muted-foreground">Get tailored recommendations based on your research interests and history.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm">
                                <h3 className="text-xl font-bold mb-3">Collaborative Tools</h3>
                                <p className="text-muted-foreground">Share projects, findings, and insights with your team or colleagues.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
