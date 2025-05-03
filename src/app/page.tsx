"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { IntroducingRemAI } from "@/components/shared/introducing-rem-ai";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { searchArxivPapers } from "@/lib/services/arxiv-service";
import { ArxivPaper } from "@/lib/store/project-store";
import { PaperSearchGrid } from "@/components/project/paper-search-grid";

const placeholders = [
  "Search for papers on quantum computing...",
  "Find research about machine learning...",
  "Look up papers on climate change...",
  "Search for neural networks...",
  "Explore research in computer vision...",
  "Find papers on genomics and DNA sequencing...",
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null);
  const [searchResults, setSearchResults] = useState<ArxivPaper[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        setDebouncedQuery(query);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query for ArXiv papers
  const { isLoading: isSearching } = useQuery({
    queryKey: ["arxivSearch", debouncedQuery],
    queryFn: async () => {
      try {
        if (debouncedQuery.length < 3) return [];
        const papers = await searchArxivPapers(debouncedQuery);
        setSearchResults(papers);
        return papers;
      } catch (error) {
        console.error("Error searching papers:", error);
        toast.error("Failed to search papers. Please try again.");
        return [];
      }
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
      setSelectedPaper(null);
    }
  };

  const handleSelectPaper = (paper: ArxivPaper) => {
    setSelectedPaper(paper);
  };

  const handleCreateProject = () => {
    // Redirect to sign in page with return URL to create project
    if (selectedPaper) {
      // Format: /auth/signin?returnUrl=%2Fproject%2Fnew%3Fpaper%3DPAPER_ID
      const returnUrl = encodeURIComponent(
        `/project/new?paper=${selectedPaper.id}`,
      );
      router.push(`/auth/sign-in?returnUrl=${returnUrl}`);
      toast.info("Please sign in to create a project");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          {/* Hero Section */}
          <section className="px-4 pt-16 pb-8 w-full relative">
            <IntroducingRemAI />

            <div className="flex flex-col items-center justify-center mt-16 mb-12">
              <div className="flex items-baseline">
                <h1 className="font-[family-name:var(--font-instrument-serif)] text-7xl md:text-9xl font-bold text-[#C96442]">
                  REM
                </h1>
              </div>
              <p className="text-xl md:text-2xl font-[family-name:var(--font-work-sans)] font-medium text-black dark:text-white -mt-1">
                Research Made Accessible
              </p>
            </div>

            <div className="max-w-3xl mx-auto mt-10 mb-12">
              <div className="w-full max-w-xl mx-auto">
                <div className="relative">
                  <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (selectedPaper) {
                        handleCreateProject();
                      }
                    }}
                    className="bg-white dark:bg-[#1C1C1C] border-[#E3DACC] dark:border-[#BFB8AC]/30 focus:border-[#C96442] dark:focus:border-[#C96442]"
                  />
                </div>
                <div className="flex justify-between items-center mt-3 px-6 md:px-4">
                  {query && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setQuery("");
                        setSearchResults([]);
                        setSelectedPaper(null);
                      }}
                      className="h-9 w-9 text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] hover:bg-transparent flex-shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                  {!query && <div className="h-9 w-9" />}
                  {selectedPaper && (
                    <Button
                      onClick={handleCreateProject}
                      size="sm"
                      className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] h-9 rounded-full text-sm px-4 flex items-center gap-1.5"
                    >
                      <Sparkles className="h-4 w-4" />
                      Create Project
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-4">
                <p className="text-sm text-neutral-400">
                  Powered by AI • 1M+ papers • Personalized learning
                </p>
              </div>
            </div>
          </section>

          {/* Search Results Grid */}
          {(debouncedQuery.length >= 3 || searchResults.length > 0) && (
            <div
              className={cn(
                "mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#C96442] scrollbar-track-transparent",
                debouncedQuery
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none",
                "max-h-[400px]", // Fixed pixel height
              )}
            >
              <div className="pb-4">
                {isSearching ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="relative p-4 border border-[#E3DACC] dark:border-[#BFB8AC]/30 rounded-lg hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/5 transition-colors duration-200"
                      >
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-3/4 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                          <Skeleton className="h-16 w-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-4 w-4 rounded-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                              <Skeleton className="h-4 w-20 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                            </div>
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-4 w-4 rounded-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                              <Skeleton className="h-4 w-24 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <PaperSearchGrid
                    papers={searchResults.slice(0, 9)}
                    isLoading={isSearching}
                    selectedPaper={selectedPaper}
                    onSelect={handleSelectPaper}
                    onCreateProject={handleCreateProject}
                    isCreating={false}
                  />
                )}
              </div>
            </div>
          )}

          {/* Rest of the sections */}
          <div className="w-full">
            {/* Explore Section */}
            <section className="py-16 px-4 bg-gradient-to-b from-white to-stone-50 dark:from-[#1C1C1C] dark:to-stone-900">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 font-[family-name:var(--font-instrument-serif)] text-[#C96442]">
                  Explore Research Like Never Before
                </h2>
                <p className="text-lg md:text-xl text-center text-[#262625]/70 dark:text-[#BFB8AC] mb-12 max-w-3xl mx-auto">
                  Transform complex research papers into interactive learning
                  experiences with our AI-powered tools.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white dark:bg-[#262625] p-6 rounded-xl shadow-sm border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <div className="h-12 w-12 bg-[#C96442]/10 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="h-6 w-6 text-[#C96442]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Smart Summaries
                    </h3>
                    <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                      Get instant, comprehensive summaries of research papers
                      powered by multimodal AI.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#262625] p-6 rounded-xl shadow-sm border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <div className="h-12 w-12 bg-[#C96442]/10 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="h-6 w-6 text-[#C96442]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Flashcards</h3>
                    <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                      Convert key concepts into interactive flashcards for
                      effective learning and retention.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#262625] p-6 rounded-xl shadow-sm border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <div className="h-12 w-12 bg-[#C96442]/10 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="h-6 w-6 text-[#C96442]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Audio Learning
                    </h3>
                    <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                      Listen to AI-generated podcasts summarizing research
                      papers on the go.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#262625] p-6 rounded-xl shadow-sm border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <div className="h-12 w-12 bg-[#C96442]/10 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="h-6 w-6 text-[#C96442]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Interactive Q&A
                    </h3>
                    <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                      Engage in dynamic discussions with AI about any aspect of
                      the research.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section className="py-16 px-4 bg-[#C96442]/5 dark:bg-[#C96442]/10">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-4xl font-bold mb-6 font-[family-name:var(--font-instrument-serif)] text-[#C96442]">
                      About REM
                    </h2>
                    <p className="text-lg text-[#262625]/70 dark:text-[#BFB8AC] mb-6">
                      REM is revolutionizing how researchers, students, and
                      professionals interact with academic papers. By leveraging
                      the power of arXiv&apos;s extensive database and
                      cutting-edge AI technology, we transform complex research
                      into accessible knowledge.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 mt-1 text-[#C96442]">✓</div>
                        <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                          Access to over 1 million research papers from arXiv
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 mt-1 text-[#C96442]">✓</div>
                        <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                          Multimodal AI understanding of text, equations, and
                          figures
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 mt-1 text-[#C96442]">✓</div>
                        <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                          Personalized learning paths and recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-video rounded-xl overflow-hidden shadow-xl border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#C96442] to-[#C96442]/50 opacity-20"></div>
                      <img
                        src="/demo-placeholder.png"
                        alt="REM Demo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-white dark:bg-[#1C1C1C]">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12 font-[family-name:var(--font-instrument-serif)] text-[#C96442]">
                  Powerful Features for Research
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="p-6 rounded-xl border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <h3 className="text-xl font-semibold mb-4">
                      Smart Summaries
                    </h3>
                    <ul className="space-y-3 text-[#262625]/70 dark:text-[#BFB8AC]">
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Key findings extraction
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Visual data interpretation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Mathematical equation explanations
                      </li>
                    </ul>
                  </div>
                  <div className="p-6 rounded-xl border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <h3 className="text-xl font-semibold mb-4">
                      Interactive Learning
                    </h3>
                    <ul className="space-y-3 text-[#262625]/70 dark:text-[#BFB8AC]">
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        AI-powered Q&A
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Dynamic flashcards
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Progress tracking
                      </li>
                    </ul>
                  </div>
                  <div className="p-6 rounded-xl border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                    <h3 className="text-xl font-semibold mb-4">
                      Audio Learning
                    </h3>
                    <ul className="space-y-3 text-[#262625]/70 dark:text-[#BFB8AC]">
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        AI-generated podcasts
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Voice-based interactions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#C96442]">•</span>
                        Mobile-friendly learning
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-50 dark:bg-stone-900 border-t border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">About REM</h3>
                    <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-4">
                      Making research accessible through AI-powered learning
                      tools and comprehensive paper analysis.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Features</h3>
                    <ul className="space-y-2 text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                      <li>Smart Summaries</li>
                      <li>Interactive Flashcards</li>
                      <li>AI-Generated Podcasts</li>
                      <li>Dynamic Q&A</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Resources</h3>
                    <ul className="space-y-2 text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                      <li>Documentation</li>
                      <li>API Reference</li>
                      <li>Research Papers</li>
                      <li>Community</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                      <li>Terms of Service</li>
                      <li>Privacy Policy</li>
                      <li>Cookie Policy</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-[#E3DACC] dark:border-[#BFB8AC]/30">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                      © 2025 REM. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                      <a
                        href="https://x.com/sarthxk20"
                        className="text-[#C96442] hover:text-[#C96442]/80"
                      >
                        Twitter
                      </a>
                      <a
                        href="https://github.com/srthkdev"
                        className="text-[#C96442] hover:text-[#C96442]/80"
                      >
                        GitHub
                      </a>
                      <a
                        href="https://www.linkedin.com/in/sarthak-jain-32b114228/"
                        className="text-[#C96442] hover:text-[#C96442]/80"
                      >
                        Linkedin
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
