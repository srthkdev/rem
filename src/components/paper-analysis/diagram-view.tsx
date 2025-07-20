
import { projects } from "@/database/schema";
import { MermaidRenderer } from "@/components/ui/mermaid-renderer";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface DiagramViewProps {
  project: typeof projects.$inferSelect;
}

const DIAGRAM_TYPES = [
  { key: "flowchart", label: "Flowchart", description: "Process workflow" },
  { key: "mindmap", label: "Mind Map", description: "Concept relationships" },
  { key: "timeline", label: "Timeline", description: "Chronological flow" },
];

export function DiagramView({ project }: DiagramViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customDiagram, setCustomDiagram] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleRegenerateDiagram = async (diagramType: string) => {
    if (!project.paperText) {
      toast.error("No paper text available for diagram generation");
      return;
    }

    setIsGenerating(true);
    setCustomDiagram(null);

    try {
      const response = await fetch(`/api/projects/${project.id}/regenerate-diagram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diagramType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate diagram");
      }

      const data = await response.json();
      setCustomDiagram(data.diagramSyntax);
      
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      const diagramTypeLabel = DIAGRAM_TYPES.find(t => t.key === diagramType)?.label || "Diagram";
      toast.success(`${diagramTypeLabel} generated successfully!`);
    } catch (error) {
      console.error("Error generating diagram:", error);
      toast.error("Failed to generate diagram. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDiagram = customDiagram || project.diagramSyntax;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">
          Research Diagram
        </h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isGenerating || !project.paperText}
                className={[
                  "flex items-center gap-2 transition-colors",
                  "hover:text-[#C96442] focus:text-[#C96442]",
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
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {DIAGRAM_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type.key}
                  onClick={() => handleRegenerateDiagram(type.key)}
                  className="hover:text-[#C96442] focus:text-[#C96442]"
                >
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div>
        {currentDiagram ? (
          <div>
            <MermaidRenderer syntax={currentDiagram} />
            {customDiagram && (
              <div className="mt-4 p-3 bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 rounded-lg border-l-4 border-[#C96442]">
                <p className="text-sm text-[#C96442] font-medium mb-1">
                  ✨ AI-Enhanced Diagram
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Generated with RAG context and advanced analysis
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {project.paperText 
                ? "No diagram available. Generate one using AI analysis."
                : "No paper text available. Please upload a paper first."
              }
            </p>
            {project.paperText && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isGenerating}
                    className={[
                      "flex items-center gap-2 transition-colors",
                      "bg-[#C96442] hover:bg-[#B85A3A] text-white",
                    ].join(" ")}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Diagram...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Diagram
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {DIAGRAM_TYPES.map((type) => (
                    <DropdownMenuItem
                      key={type.key}
                      onClick={() => handleRegenerateDiagram(type.key)}
                      className="hover:text-[#C96442] focus:text-[#C96442]"
                    >
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
