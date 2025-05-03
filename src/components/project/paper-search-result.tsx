"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Check, Clock, User } from "lucide-react";
import { ArxivPaper } from "@/lib/store/project-store";
import { cn } from "@/lib/utils";

interface PaperSearchResultProps {
  paper: ArxivPaper;
  isSelected: boolean;
  onSelect: (paper: ArxivPaper) => void;
  size?: "small" | "medium" | "large";
}

export function PaperSearchResult({
  paper,
  isSelected,
  onSelect,
  size = "small",
}: PaperSearchResultProps) {
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Adjust truncation length based on card size
  const summaryLength = size === "large" ? 300 : size === "medium" ? 150 : 100;
  const showFullMetadata = size === "large";

  return (
    <Card
      className={cn(
        "h-full border border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-[#FAF9F6]/50 dark:bg-[#262625]/50 rounded-lg shadow-sm backdrop-blur-md overflow-visible transition-all duration-200",
        "hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/5 cursor-pointer",
        isSelected && "border-[#C96442] bg-[#C96442]/5 dark:bg-[#C96442]/10",
      )}
      onClick={() => onSelect(paper)}
    >
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-start gap-3 h-full">
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              isSelected
                ? "bg-[#C96442] text-[#FAF9F6]"
                : "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6]",
            )}
          >
            {isSelected ? (
              <Check className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <h3
              className={cn(
                "font-medium text-[#262625] dark:text-[#FAF9F6] mb-1",
                size === "large" ? "text-lg line-clamp-2" : "line-clamp-2",
              )}
            >
              {paper.title}
            </h3>
            <p
              className={cn(
                "text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2",
                size === "large" ? "line-clamp-4" : "line-clamp-2",
              )}
            >
              {truncate(paper.summary, summaryLength)}
            </p>
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70">
                <Clock className="h-3 w-3" />
                <span>{formatDate(paper.publishedDate)}</span>
                {showFullMetadata ? (
                  <>
                    <span className="mx-1">•</span>
                    <span className="bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/20 px-2 py-0.5 rounded-full">
                      {paper.categories[0] || "Research"}
                    </span>
                  </>
                ) : (
                  <span className="ml-auto bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/20 px-2 py-0.5 rounded-full">
                    {paper.categories[0] || "Research"}
                  </span>
                )}
              </div>
              {showFullMetadata &&
                paper.authors &&
                paper.authors.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70 mt-2">
                    <User className="h-3 w-3" />
                    <span className="truncate">
                      {paper.authors.slice(0, 2).join(", ")}
                      {paper.authors.length > 2 && " et al."}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
