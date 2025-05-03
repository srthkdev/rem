"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { searchArxivPapers } from "@/lib/services/arxiv-service";
import { ArxivPaper } from "@/lib/store/project-store";

import { Button } from "@/components/ui/button";
import { PaperSearchResult } from "@/components/project/paper-search-result";
import { Loader2, ArrowRight, X } from "lucide-react";

import { toast } from "sonner";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useProjectUIStore } from "@/lib/store/project-store";

// Schema for search form
const searchSchema = z.object({
  query: z.string().min(3, {
    message: "Search query must be at least 3 characters.",
  }),
});

// Placeholder texts for the search input
const placeholders = [
  "Search for quantum computing papers...",
  "Find research on machine learning...",
  "Look up papers about climate change...",
  "Search for neural networks...",
  "Find the latest on artificial intelligence...",
  "Explore research in computer vision...",
];

type SearchFormValues = z.infer<typeof searchSchema>;

export function ArxivSearchInput() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Access the project UI store
  const {
    searchResults,
    setSearchResults,
    selectedPaper,
    setSelectedPaper,
    clearSearchResults,
  } = useProjectUIStore();

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        setDebouncedQuery(query);
        setIsSearching(true);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle success and error side effects
  const { data, error, isLoading } = useQuery<ArxivPaper[]>({
    queryKey: ["arxivSearch", debouncedQuery],
    queryFn: async () => {
      try {
        if (debouncedQuery.length < 3) return [];
        return await searchArxivPapers(debouncedQuery);
      } catch (error) {
        console.error("Error searching papers:", error);
        toast.error("Failed to search papers. Please try again.");
        return [];
      }
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setSearchResults(data);
      setIsSearching(false);
    }
    if (error) {
      toast.error("Failed to search papers. Please try again.");
      setIsSearching(false);
    }
  }, [data, error, setSearchResults]);

  // Handle creating a new project with selected paper
  const createProjectMutation = useMutation({
    mutationFn: async (paper: ArxivPaper) => {
      // Create a new project with the selected paper
      const newProject = {
        id: uuidv4(),
        title: paper.title,
        description: query,
        createdAt: new Date(),
        updatedAt: new Date(),
        paper,
        lastMessage: "Project created with paper",
      };

      return newProject.id;
    },
    onSuccess: (projectId) => {
      toast.success("New project created successfully!");
      router.push(`/project/${projectId}`);
    },
    onError: () => {
      toast.error("Failed to create project. Please try again.");
    },
  });

  // Handle creating a project
  const handleCreateProject = () => {
    if (selectedPaper) {
      createProjectMutation.mutate(selectedPaper);
    }
  };

  // Handle selecting a paper
  const handleSelectPaper = (paper: ArxivPaper) => {
    setSelectedPaper(paper);
  };

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle input change from the PlaceholdersAndVanishInput
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // If the input is empty, clear search results
    if (!newValue.trim()) {
      clearSearchResults();
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.length >= 3) {
      setDebouncedQuery(query);
      setIsSearching(true);
      setShowResults(true);
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        />
        {query && showResults && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => {
              setQuery("");
              clearSearchResults();
              setShowResults(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[500px] overflow-y-auto rounded-xl border border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-[#FAF9F6] dark:bg-[#262625] shadow-lg"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6]">
                Search Results
              </h3>
              {selectedPaper && (
                <Button
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] h-8 rounded-full gap-1"
                >
                  {createProjectMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )}
                  <span className="text-xs">Create Project</span>
                </Button>
              )}
            </div>

            {isSearching || isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-[#C96442] animate-spin mb-2" />
                <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                  Searching for papers...
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2">
                  No papers found matching your query.
                </p>
                <p className="text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70">
                  Try different keywords or a more specific search.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((paper) => (
                  <PaperSearchResult
                    key={paper.id}
                    paper={paper}
                    isSelected={selectedPaper?.id === paper.id}
                    onSelect={handleSelectPaper}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
