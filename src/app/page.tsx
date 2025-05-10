"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { IntroducingRemAI } from "@/components/shared/introducing-rem-ai";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import {
  X,
  Sparkles,
  Plus,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  User,
  Heart,
  Calendar,
  Globe,
  Shield,
  Book,
  FileText,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { searchArxivPapers } from "@/lib/services/arxiv-service";
import { ArxivPaper } from "@/lib/store/project-store";
import { PaperSearchGrid } from "@/components/project/paper-search-grid";
import { HeroVideoDialog } from "@/components/magicui/hero-video-dialog";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { FeaturesSectionDemo } from "@/components/magicui/features-section-demo";

const placeholders = [
  "Search for papers on quantum computing...",
  "Find research about machine learning...",
  "Look up papers on climate change...",
  "Search for neural networks...",
  "Explore research in computer vision...",
  "Find papers on genomics and DNA sequencing...",
];

const avatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/16860528",
    profileUrl: "https://github.com/dillionverma",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59442788",
    profileUrl: "https://github.com/sanjay-mali",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/89768406",
    profileUrl: "https://github.com/itsarghyadas",
  },
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
      // Store pending project in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "pendingProject",
          JSON.stringify({
            title: selectedPaper.title,
            description: query,
            paper: selectedPaper,
          }),
        );
      }
      // Redirect to sign in with returnUrl to /project/new
      const returnUrl = encodeURIComponent(`/project/new`);
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
          <section className="min-h-[85vh] px-4 w-full relative flex flex-col items-center justify-start pt-20">
            <IntroducingRemAI />

            <div className="flex flex-col items-center justify-center mt-8">
              <div className="flex items-baseline">
                <h1 className="font-[family-name:var(--font-instrument-serif)] text-8xl md:text-[150px] font-bold text-[#C96442]">
                  REM
                </h1>
              </div>
              <p className="text-2xl md:text-3xl font-[family-name:var(--font-work-sans)] font-medium text-black dark:text-white -mt-2">
                Research Made Accessible
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto mt-12">
              <div className="w-full mx-auto">
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
                    className="bg-white dark:bg-[#1C1C1C] border-[#E3DACC] dark:border-[#BFB8AC]/30 focus:border-[#C96442] dark:focus:border-[#C96442] h-14 text-lg"
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

              <div className="mt-4 flex items-center justify-center gap-4">
                <p className="text-sm text-neutral-400">
                  Powered by AI • 1M+ papers • Personalized learning
                </p>
              </div>
            </div>

            {/* Search Results Grid */}
            {(debouncedQuery.length >= 3 || searchResults.length > 0) && (
              <div
                className={cn(
                  "w-full max-w-4xl mx-auto mt-8",
                  debouncedQuery
                    ? "opacity-100 transition-opacity duration-200"
                    : "opacity-0 pointer-events-none",
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
          </section>

          {/* Video Section */}
          <section className="w-full py-12 mt-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-instrument-serif)] text-[#C96442] mb-4">
                  See REM in Action
                </h2>
                <p className="text-lg md:text-xl text-[#262625]/70 dark:text-[#BFB8AC] max-w-2xl mx-auto">
                  Watch how REM transforms complex research papers into
                  interactive learning experiences
                </p>
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="relative pb-[60.46875%] h-0">
                  <iframe
                    src="https://www.loom.com/embed/bef3e28db8584c70af7d9134edfb5fd6?sid=fab7015e-c6a1-41a3-935d-370feb10069f"
                    frameBorder="0"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
                  />
                </div>
              </div>

              {/* Trust and Powered By Section */}
              <div className="mt-16 flex flex-row justify-between items-start max-w-6xl mx-auto pb-20 px-2">
                {/* Trusted By Section */}
                <div className="flex flex-col items-start gap-4 w-1/3 ml-auto mr-20">
                  <h3 className="text-2xl font-bold text-[#262625] dark:text-[#FAF9F6]">
                    Trusted by Engineers & Researchers
                  </h3>
                  <AvatarCircles
                    numPeople={99}
                    avatarUrls={avatars}
                    className="[&_img]:h-9 [&_img]:w-9 -space-x-3 [&_a:last-child]:h-9 [&_a:last-child]:w-9 [&_a:last-child]:text-xs"
                  />
                </div>

                {/* Powered By Section */}
                <div className="w-1/2 flex flex-col items-center gap-6">
                  <h3 className="text-2xl font-bold text-[#262625] dark:text-[#FAF9F6] self-center mb-2">
                    Powered By
                  </h3>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-3 place-items-center w-[90%]">
                    <img
                      src="/nextjs.png"
                      alt="Next.js"
                      className="h-10 dark:invert"
                    />
                    <img src="/mem0.png" alt="Memo" className="h-24" />
                    <img
                      src="/firecrawl.png"
                      alt="Firecrawl"
                      className="h-24"
                    />
                    <img
                      src="/arxiv.png"
                      alt="arXiv"
                      className="h-20 col-start-1 col-end-2"
                    />
                    <img
                      src="/agno-logo.png"
                      alt="Agno"
                      className="h-10 col-start-2 col-end-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <FeaturesSectionDemo />

          {/* Footer */}
          <footer
            className={cn(
              "mt-20 rounded-t-3xl bg-[#262625] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#262625] shadow-lg",
            )}
          >
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
                {/* Company Column */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#C96442]" />
                    About REM
                  </h3>
                  <p className="text-sm text-[#FAF9F6]/70 dark:text-[#262625]/70 mb-6">
                    Making research accessible through AI-powered learning tools
                    and comprehensive paper analysis.
                  </p>
                  <div className="flex gap-1 mb-2">
                    <img
                      src="/arxiv.png"
                      alt="ISO 27001"
                      className="h-15 w-30"
                    />
                  </div>
                </div>

                {/* Platform Column */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#C96442]" />
                    Platform
                  </h3>
                  <ul className="space-y-3 text-sm text-[#FAF9F6]/70 dark:text-[#262625]/70">
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <Book className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Smart Summaries
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <FileText className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Interactive Flashcards
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <Heart className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        AI-Generated Podcasts
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <Calendar className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Dynamic Q&A
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Resources Column */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Book className="h-5 w-5 text-[#C96442]" />
                    Resources
                  </h3>
                  <ul className="space-y-3 text-sm text-[#FAF9F6]/70 dark:text-[#262625]/70">
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <FileText className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Documentation
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <Book className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        API Reference
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <FileText className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Research Papers
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <User className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Community
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company/Legal Column */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#C96442]" />
                    Legal
                  </h3>
                  <ul className="space-y-3 text-sm text-[#FAF9F6]/70 dark:text-[#262625]/70">
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <FileText className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Terms of Service
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <Shield className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li className="flex items-center gap-2 transition-colors hover:text-[#C96442]">
                      <Shield className="h-4 w-4" />
                      <a
                        href="#"
                        className="hover:underline focus:underline focus:outline-none"
                      >
                        Cookie Policy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Section with Copyright and Social Media */}
              <div className="mt-10 pt-8 border-t border-[#FAF9F6]/10 dark:border-[#262625]/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-[#FAF9F6]/70 dark:text-[#262625]/70">
                      © 2025 REM. All rights reserved.
                    </p>
                    <address className="not-italic text-xs text-[#FAF9F6]/50 dark:text-[#262625]/50 flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>123 Research Ave, San Francisco, CA 94107</span>
                    </address>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href="#"
                      className="p-2 rounded-full bg-[#FAF9F6]/5 dark:bg-[#262625]/5 hover:bg-[#C96442]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442] focus:ring-offset-2 focus:ring-offset-[#262625] dark:focus:ring-offset-[#FAF9F6]"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5 text-[#C96442]" />
                    </a>
                    <a
                      href="#"
                      className="p-2 rounded-full bg-[#FAF9F6]/5 dark:bg-[#262625]/5 hover:bg-[#C96442]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442] focus:ring-offset-2 focus:ring-offset-[#262625] dark:focus:ring-offset-[#FAF9F6]"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5 text-[#C96442]" />
                    </a>
                    <a
                      href="#"
                      className="p-2 rounded-full bg-[#FAF9F6]/5 dark:bg-[#262625]/5 hover:bg-[#C96442]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442] focus:ring-offset-2 focus:ring-offset-[#262625] dark:focus:ring-offset-[#FAF9F6]"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-[#C96442]" />
                    </a>
                    <a
                      href="#"
                      className="p-2 rounded-full bg-[#FAF9F6]/5 dark:bg-[#262625]/5 hover:bg-[#C96442]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442] focus:ring-offset-2 focus:ring-offset-[#262625] dark:focus:ring-offset-[#FAF9F6]"
                      aria-label="Email"
                    >
                      <Mail className="h-5 w-5 text-[#C96442]" />
                    </a>
                    <a
                      href="#"
                      className="p-2 rounded-full bg-[#FAF9F6]/5 dark:bg-[#262625]/5 hover:bg-[#C96442]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442] focus:ring-offset-2 focus:ring-offset-[#262625] dark:focus:ring-offset-[#FAF9F6]"
                      aria-label="Phone"
                    >
                      <Phone className="h-5 w-5 text-[#C96442]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
