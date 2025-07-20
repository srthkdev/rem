import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { projects } from "@/database/schema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const MODES = [
  { key: "eli5", label: "For Kids (ELI5)" },
  { key: "college", label: "College Level" },
  { key: "expert", label: "Expert Level" },
] as const;

interface SimplifiedPaperProps {
  project: typeof projects.$inferSelect;
}

export function SimplifiedPaper({ project }: SimplifiedPaperProps) {
  const [mode, setMode] = useState("eli5");
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customSummary, setCustomSummary] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const summary = customSummary || {
    eli5: project.summaryEli5,
    college: project.summaryCollege,
    expert: project.summaryExpert,
  }[mode];

  const handleGenerate = async () => {
    if (!project.paperText) {
      toast.error("No paper text available for processing");
      return;
    }

    setIsGenerating(true);
    setCustomSummary(null);

    try {
      const response = await fetch(`/api/projects/${project.id}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level: mode }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setCustomSummary(data.summary);
      
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      toast.success(`${MODES.find(m => m.key === mode)?.label} summary generated successfully!`);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">
          Simplified Paper
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !project.paperText}
            size="sm"
            className={[
              "flex items-center gap-2 transition-colors",
              "bg-[#C96442] hover:bg-[#B85A3A] text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </Button>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={[
                  "min-w-[180px] flex items-center justify-between gap-2 transition-colors",
                  open ? "text-[#C96442] border-[#C96442]" : "",
                  "hover:text-[#C96442] focus:text-[#C96442]",
                ].join(" ")}
              >
                <span>{MODES.find((m) => m.key === mode)?.label}</span>
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={mode} onValueChange={(newMode) => {
                setMode(newMode);
                setCustomSummary(null); // Clear custom summary when mode changes
              }}>
                {MODES.map((m) => (
                  <DropdownMenuRadioItem
                    key={m.key}
                    value={m.key}
                    className={[
                      mode === m.key
                        ? "!bg-[#E3DACC] dark:!bg-[#BFB8AC]/10 font-semibold text-[#262625] dark:text-[#FAF9F6]"
                        : "hover:text-[#C96442] focus:text-[#C96442]",
                      "relative pl-4",
                    ].join(" ")}
                  >
                    {m.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        {summary ? (
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{summary}</div>
            {customSummary && (
              <div className="mt-4 p-3 bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 rounded-lg border-l-4 border-[#C96442]">
                <p className="text-sm text-[#C96442] font-medium mb-1">
                  ✨ AI-Enhanced Summary
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Generated with RAG context and external knowledge
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {project.paperText 
                ? "Please provide me with the research paper and the context. I need that information to summarize it for a five-year-old."
                : "No paper text available. Please upload a paper first."
              }
            </p>
            {project.paperText && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={[
                  "flex items-center gap-2 transition-colors",
                  "bg-[#C96442] hover:bg-[#B85A3A] text-white",
                ].join(" ")}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {MODES.find(m => m.key === mode)?.label} Summary
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
