"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Check, Clock } from "lucide-react";
import { ArxivPaper } from "@/lib/store/project-store";
import { cn } from "@/lib/utils";

interface PaperSearchResultProps {
  paper: ArxivPaper;
  isSelected: boolean;
  onSelect: (paper: ArxivPaper) => void;
}

export function PaperSearchResult({
  paper,
  isSelected,
  onSelect,
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

  return (
    <Card
      className={cn(
        "border border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-[#FAF9F6]/50 dark:bg-[#262625]/50 rounded-lg shadow-sm backdrop-blur-md overflow-visible transition-all duration-200",
        "hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/5 cursor-pointer",
        isSelected && "border-[#C96442] bg-[#C96442]/5 dark:bg-[#C96442]/10"
      )}
      onClick={() => onSelect(paper)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              isSelected ? "bg-[#C96442] text-[#FAF9F6]" : "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6]"
            )}
          >
            {isSelected ? (
              <Check className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[#262625] dark:text-[#FAF9F6] mb-1 line-clamp-2">
              {paper.title}
            </h3>
            <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-2 line-clamp-2">
              {truncate(paper.summary, 150)}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70">
              <Clock className="h-3 w-3" />
              <span>{formatDate(paper.publishedDate)}</span>
              <span className="bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/20 px-2 py-0.5 rounded-full">
                {paper.categories[0] || "Research"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 