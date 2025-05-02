"use client";

import React from "react";
import { ArxivPaper } from "@/lib/store/project-store";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { PaperSearchResult } from "@/components/project/paper-search-result";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface PaperSearchGridProps {
  papers: ArxivPaper[];
  isLoading: boolean;
  selectedPaper: ArxivPaper | null;
  onSelect: (paper: ArxivPaper) => void;
  onCreateProject: () => void;
  isCreating: boolean;
}

export function PaperSearchGrid({
  papers,
  isLoading,
  selectedPaper,
  onSelect,
  onCreateProject,
  isCreating,
}: PaperSearchGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#C96442] animate-spin mb-4" />
        <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
          Searching for papers...
        </p>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2">
          No papers found matching your query.
        </p>
        <p className="text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70">
          Try different keywords or a more specific search.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {papers.map((paper) => (
          <div key={paper.id}>
            <PaperSearchResult
              paper={paper}
              isSelected={selectedPaper?.id === paper.id}
              onSelect={onSelect}
              size="small"
            />
          </div>
        ))}
      </div>
      
      
    
    </div>
  );
} 