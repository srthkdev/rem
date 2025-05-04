"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IntroducingRemAI } from "@/components/shared/introducing-rem-ai";
import { searchArxivPapers } from "@/lib/services/arxiv-service";

import { ArxivPaper } from "@/lib/store/project-store";
import { useCreateProject, CreateProjectInput } from "@/hooks/useProjects";
import { useAuthStore } from "@/lib/store/auth-store";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { PaperSearchGrid } from "@/components/project/paper-search-grid";
import { X, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder texts for paper search input
const placeholders = [
  "Search for papers on quantum computing...",
  "Find research about machine learning...",
  "Look up papers on climate change...",
  "Search for neural networks...",
  "Explore research in computer vision...",
  "Find papers on genomics and DNA sequencing...",
];

// Search schema for validation
const searchSchema = z.object({
  query: z.string().min(3, {
    message: "Search query must be at least 3 characters.",
  }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

// Add this function at the top level after imports
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// Zod schema for pending project
const PendingProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  paper: z.any(),
});

export default function NewProject() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get("paper");

  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [userInput, setUserInput] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null);
  const [searchResults, setSearchResults] = useState<ArxivPaper[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingProjectLoading, setPendingProjectLoading] = useState(false);
  const hasCreated = useRef(false);

  // Project creation mutation
  const createProjectMutation = useCreateProject();
  // Get user info
  const user = useAuthStore((s) => s.user);
  const userName = user?.name
    ? user.name.split(" ")[0].charAt(0).toUpperCase() +
      user.name.split(" ")[0].slice(1)
    : user?.email?.split("@")?.[0] || "User";

  // Stable mutation for sessionStorage-based creation
  type ProjectCreateResponse = { id?: string; success?: boolean };
  const sessionMutation = useMutation<
    ProjectCreateResponse,
    Error,
    CreateProjectInput
  >({
    mutationFn: async (input) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: (data) => {
      sessionStorage.removeItem("pendingProject");
      sessionStorage.removeItem("pendingProjectProcessing");
      setPendingProjectLoading(false);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (data && data.id) {
        router.replace(`/project/${data.id}`);
      } else {
        router.replace("/project");
      }
    },
    onError: () => {
      sessionStorage.removeItem("pendingProject");
      sessionStorage.removeItem("pendingProjectProcessing");
      setPendingProjectLoading(false);
      router.replace("/project");
    },
  });

  // Handle paper ID from URL on component mount
  useEffect(() => {
    const fetchPaperFromId = async () => {
      if (paperId) {
        try {
          console.log("Fetching paper with ID:", paperId);
          // Use a simple fetch for arXiv ID to prevent any issues
          const response = await fetch(
            `https://export.arxiv.org/api/query?id_list=${paperId}`,
          );
          const xmlText = await response.text();

          // Simple XML parsing for demonstration
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");

          const entry = xmlDoc.querySelector("entry");
          if (entry) {
            const title = entry.querySelector("title")?.textContent || "";
            const summary = entry.querySelector("summary")?.textContent || "";
            const authors = Array.from(
              entry.querySelectorAll("author name"),
            ).map((name) => name.textContent || "");
            const published =
              entry.querySelector("published")?.textContent || "";
            const pdfUrl =
              entry.querySelector("link[title='pdf']")?.getAttribute("href") ||
              "";

            const paper: ArxivPaper = {
              id: paperId,
              title: title,
              summary: summary,
              authors: authors,
              publishedDate: published,
              pdfUrl: pdfUrl,
              categories: [],
            };

            setSelectedPaper(paper);
            console.log("Paper found, creating project:", paper.title);
            // Auto-create project with small delay to ensure everything is loaded
            setTimeout(() => {
              handleCreateProject(paper);
            }, 500);
          } else {
            throw new Error("Paper not found");
          }
        } catch (error) {
          console.error("Error fetching paper:", error);
          toast.error("Failed to load paper details. Please try again.");
        }
      }
    };

    fetchPaperFromId();
  }, [paperId]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        setDebouncedQuery(query);
        setUserInput(query); // Save user input for project creation
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query for ArXiv papers
  const { isLoading: isSearching, data: searchData } = useQuery({
    queryKey: ["arxivSearch", debouncedQuery],
    queryFn: async () => {
      try {
        if (debouncedQuery.length < 3) return [];
        const papers = await searchArxivPapers(debouncedQuery);
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

  // Update search results when data changes
  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData);
    }
  }, [searchData, setSearchResults]);

  // Create project handler
  const handleCreateProject = async (paper: ArxivPaper = selectedPaper!) => {
    if (!paper) {
      toast.error("No paper selected");
      return;
    }
    setIsCreating(true);
    const toastId = toast.loading("Creating project...");
    createProjectMutation.mutate(
      {
        title: paper.title,
        description: userInput,
        paper: paper,
      },
      {
        onSuccess: (data) => {
          toast.dismiss(toastId);
          toast.success("Project created successfully!");
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          setIsCreating(false);
          if (data && data.id) {
            router.push(`/project/${data.id}`);
          } else {
            router.push("/project");
          }
        },
        onError: () => {
          toast.dismiss(toastId);
          toast.error("Failed to create project. Please try again.");
          setIsCreating(false);
        },
      },
    );
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // Clear results if input is empty
    if (!newValue.trim()) {
      setSearchResults([]);
      setSelectedPaper(null);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.length >= 3) {
      setDebouncedQuery(query);
      setUserInput(query);
    }
  };

  // Handle paper selection
  const handleSelectPaper = (paper: ArxivPaper) => {
    setSelectedPaper(paper);
  };

  // On mount, check for pending project in sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pending = sessionStorage.getItem("pendingProject");
    const processing = sessionStorage.getItem("pendingProjectProcessing");
    if (!pending || processing === "true") return;
    try {
      const parsed = JSON.parse(pending);
      const validated = PendingProjectSchema.safeParse(parsed);
      if (validated.success) {
        sessionStorage.setItem("pendingProjectProcessing", "true");
        setPendingProjectLoading(true);
        sessionMutation.mutate(validated.data);
      } else {
        sessionStorage.removeItem("pendingProject");
        sessionStorage.removeItem("pendingProjectProcessing");
      }
    } catch (e) {
      sessionStorage.removeItem("pendingProject");
      sessionStorage.removeItem("pendingProjectProcessing");
    }
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  // Show spinner only if a project is actually being created
  if (pendingProjectLoading || sessionMutation.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-[#C96442]">Creating your project...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-16 pb-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col items-center justify-center mt-8 mb-10">
        <IntroducingRemAI />
      </div>

      <div className="max-w-3xl mx-auto mt-10 mb-8">
        <div className="flex items-center justify-center gap-2 text-2xl md:text-4xl mb-6">
          <span className="font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#C2C0B6] font-normal">
            {getGreeting()},
          </span>
          <span className="font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#C2C0B6] font-normal">
            {userName}
          </span>
        </div>

        {/* Search Input and Buttons Container */}
        <div className="relative mb-6">
          <div className="w-full max-w-xl mx-auto">
            {" "}
            {/* Container to match input width */}
            <div className="relative">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleInputChange}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedPaper) {
                    handleCreateProject(selectedPaper);
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
              {!query && <div className="h-9 w-9" />}{" "}
              {/* Placeholder for spacing */}
              {selectedPaper && (
                <Button
                  onClick={() => handleCreateProject(selectedPaper)}
                  disabled={isCreating}
                  size="sm"
                  className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] h-9 rounded-full text-sm px-4 flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-4">
          <p className="text-sm text-neutral-400">
            Powered by AI • 1M+ papers • Personalized learning
          </p>
        </div>

        {/* Search Results Grid */}
        {(debouncedQuery.length >= 3 || searchResults.length > 0) && (
          <div
            className={cn(
              "mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#C96442] scrollbar-track-transparent",
              debouncedQuery ? "opacity-100" : "opacity-0 pointer-events-none",
              "max-h-[calc(100vh-360px)]", // Increased visible area
            )}
          >
            <div className="min-h-[calc(100vh-360px)] pb-16">
              {" "}
              {/* Ensure minimum height and extra padding */}
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
                  isCreating={isCreating}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
