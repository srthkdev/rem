
import { projects } from "@/database/schema";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Code, BookOpen, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface InsightsViewProps {
  project: typeof projects.$inferSelect;
}

export function InsightsView({ project }: InsightsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedInsights, setEnhancedInsights] = useState<any>(null);
  const queryClient = useQueryClient();

  const codeSnippets = enhancedInsights?.codeSnippets || (project.extractedCodeSnippets as { description: string, code: string, language?: string, enhancement?: string }[] | null);
  const references = enhancedInsights?.references || (project.extractedReferences as { title: string, url: string, description?: string, type?: string }[] | null);
  const keyInsights = enhancedInsights?.keyInsights || [];

  const handleGenerateInsights = async () => {
    if (!project.paperText) {
      toast.error("No paper text available for insights generation");
      return;
    }

    setIsGenerating(true);
    setEnhancedInsights(null);

    try {
      const response = await fetch(`/api/projects/${project.id}/generate-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const data = await response.json();
      setEnhancedInsights(data);
      
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      toast.success("Enhanced insights generated successfully!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">
          Research Insights
        </h3>
        <Button
          onClick={handleGenerateInsights}
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
              Enhance Insights
            </>
          )}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Key Insights Section */}
        {keyInsights && keyInsights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#C96442]" />
              <h4 className="text-md font-semibold">Key Insights</h4>
            </div>
            <div className="grid gap-4">
              {keyInsights.map((insight: any, index: number) => (
                <div key={index} className="bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 rounded-lg p-4 border-l-4 border-[#C96442]">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-[#262625] dark:text-[#FAF9F6]">{insight.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.significance === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      insight.significance === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {insight.significance}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{insight.description}</p>
                  <span className="inline-block px-2 py-1 bg-[#C96442]/10 text-[#C96442] rounded text-xs font-medium">
                    {insight.category.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippets Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-[#C96442]" />
            <h4 className="text-md font-semibold">Code Snippets & Algorithms</h4>
          </div>
          {codeSnippets && codeSnippets.length > 0 ? (
            <div className="space-y-4">
              {codeSnippets.map((snippet: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{snippet.description}</p>
                    {snippet.language && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs font-medium">
                        {snippet.language}
                      </span>
                    )}
                  </div>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto border">
                    <code>{snippet.code}</code>
                  </pre>
                  {snippet.enhancement && (
                    <div className="mt-3 p-3 bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 rounded border-l-4 border-[#C96442]">
                      <p className="text-sm text-[#C96442] font-medium mb-1">✨ AI Enhancement</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{snippet.enhancement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No code snippets extracted yet.</p>
            </div>
          )}
        </div>

        {/* References Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#C96442]" />
            <h4 className="text-md font-semibold">References & Related Work</h4>
          </div>
          {references && references.length > 0 ? (
            <div className="space-y-3">
              {references.map((ref: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-[#262625] dark:text-[#FAF9F6] mb-1">
                        {ref.url && ref.url !== 'Not available' ? (
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-[#C96442] hover:underline">
                            {ref.title}
                          </a>
                        ) : (
                          ref.title
                        )}
                      </h5>
                      {ref.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{ref.description}</p>
                      )}
                    </div>
                    {ref.type && (
                      <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                        {ref.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No references extracted yet.</p>
            </div>
          )}
        </div>

        {/* Enhanced Insights Indicator */}
        {enhancedInsights && (
          <div className="mt-6 p-4 bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 rounded-lg border-l-4 border-[#C96442]">
            <p className="text-sm text-[#C96442] font-medium mb-1">
              ✨ AI-Enhanced Insights
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Generated with RAG context, external research, and advanced analysis
            </p>
          </div>
        )}

        {/* Empty State */}
        {!codeSnippets?.length && !references?.length && !keyInsights?.length && !project.paperText && (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No Paper Available</h4>
            <p className="text-gray-400 mb-4">Upload a research paper to generate insights</p>
          </div>
        )}

        {/* Generate Insights CTA */}
        {!enhancedInsights && project.paperText && (!codeSnippets?.length && !references?.length) && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#C96442]" />
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Generate AI Insights</h4>
            <p className="text-gray-500 mb-4">Extract code, references, and key insights from your research paper</p>
            <Button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className={[
                "flex items-center gap-2 transition-colors",
                "bg-[#C96442] hover:bg-[#B85A3A] text-white",
              ].join(" ")}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Enhanced Insights
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
