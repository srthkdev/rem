"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Headphones,
  LineChart,
  SquareStack,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIPodcastTab } from "./ai-podcast-tab";
import { VisualizationTab } from "./visualization-tab";
import { FlashcardsTab } from "./flashcard";
import { AIChatTab } from "./ai-chat-tab";
import { cn } from "@/lib/utils";
import { SimplifiedPaper } from "./simplified-paper";

interface AIPaperAnalysisProps {
  userQuery: string;
  paperTitle: string;
  className?: string;
  projectId: string;
  activeTab: "analysis" | "podcast" | "visualization" | "flashcards" | "chat";
  setActiveTab: (
    tab: "analysis" | "podcast" | "visualization" | "flashcards" | "chat",
  ) => void;
}

type Tab = "analysis" | "podcast" | "visualization" | "flashcards" | "chat";

export function AIPaperAnalysis({
  userQuery,
  paperTitle,
  className,
  projectId,
  activeTab,
  setActiveTab,
}: AIPaperAnalysisProps) {
  const [showLabels, setShowLabels] = useState(true);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setShowLabels(window.innerWidth >= 768); // 768px is md breakpoint
    };

    // Set initial value
    handleResize();

    // Add debounced resize listener
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  const tabs = [
    {
      id: "analysis" as Tab,
      label: "Simplified Paper",
      icon: Brain,
      content: <SimplifiedPaper />,
    },
    {
      id: "chat" as Tab,
      label: "AI Chat",
      icon: MessageSquare,
      content: <AIChatTab projectId={projectId} />,
    },
    {
      id: "podcast" as Tab,
      label: "AI Podcast",
      icon: Headphones,
      content: <AIPodcastTab />,
    },
    {
      id: "visualization" as Tab,
      label: "Visualization",
      icon: LineChart,
      content: <VisualizationTab />,
    },
    {
      id: "flashcards" as Tab,
      label: "Flashcards",
      icon: SquareStack,
      content: <FlashcardsTab projectId={projectId} />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-[#FAF9F6]/50 dark:bg-[#262625]/50",
        className,
      )}
    >
      <div className="flex flex-col">
        <div className="flex px-2 gap-1 relative border-b border-[#C96442]/30 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C96442]/30" />
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 relative",
                  "transition-all duration-200 ease-in-out",
                  showLabels ? "min-w-[120px]" : "w-12",
                  "justify-center",
                  isActive
                    ? [
                        "text-[#C96442]",
                        "bg-[#FAF9F6] dark:bg-[#262625]",
                        "-mb-[1px]",
                        "relative",
                        "border-t border-l border-r border-[#C96442]",
                        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#FAF9F6] dark:after:bg-[#262625]",
                        "rounded-t",
                      ].join(" ")
                    : "text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                )}
                onClick={() => setActiveTab(tab.id)}
                title={!showLabels ? tab.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-[#C96442]" : "text-current",
                  )}
                />
                {showLabels && (
                  <span
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "text-[#C96442]" : "text-current",
                    )}
                  >
                    {tab.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
