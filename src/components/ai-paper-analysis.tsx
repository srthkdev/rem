"use client";

import React, { useState } from "react";
import { Brain, Headphones, LineChart, SquareStack, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchAnalysisTab } from "./research-analysis-tab";
import { AIPodcastTab } from "./ai-podcast-tab";
import { VisualizationTab } from "./visualization-tab";
import { FlashcardsTab } from "./flashcards-tab";
import { AIChatTab } from "./ai-chat-tab";
import { cn } from "@/lib/utils";

interface AIPaperAnalysisProps {
  userQuery: string;
  paperTitle: string;
  className?: string;
}

type Tab = "analysis" | "podcast" | "visualization" | "flashcards" | "chat"

export function AIPaperAnalysis({ userQuery, paperTitle, className }: AIPaperAnalysisProps) {
  const [activeTab, setActiveTab] = useState<Tab>("analysis");

  const tabs = [
    {
      id: "analysis" as Tab,
      label: "Research Analysis",
      icon: Brain,
      content: <ResearchAnalysisTab />
    },
    {
      id: "chat" as Tab,
      label: "AI Chat",
      icon: MessageSquare,
      content: <AIChatTab />
    },
    {
      id: "podcast" as Tab,
      label: "AI Podcast",
      icon: Headphones,
      content: <AIPodcastTab />
    },
    {
      id: "visualization" as Tab,
      label: "Visualization",
      icon: LineChart,
      content: <VisualizationTab />
    },
    {
      id: "flashcards" as Tab,
      label: "Flashcards",
      icon: SquareStack,
      content: <FlashcardsTab />
    }
  ]

  return (
    <div className={cn("flex flex-col h-full w-full bg-[#FAF9F6]/50 dark:bg-[#262625]/50", className)}>
      <div className="flex flex-col border-b border-[#E3DACC] dark:border-[#BFB8AC]/30">
        <div className="flex px-2 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 rounded-none border-b-2 px-4",
                  activeTab === tab.id
                    ? "border-[#C96442] text-[#C96442]"
                    : "border-transparent text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6]"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
} 