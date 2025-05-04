"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Check, X, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";

// Create Zustand store for selection state
interface ProjectSelectionState {
  selectedProjects: string[];
  isSelectionMode: boolean;
  toggleSelectionMode: () => void;
  toggleProjectSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
}

const useProjectSelection = create<ProjectSelectionState>((set, get) => ({
  selectedProjects: [],
  isSelectionMode: false,
  toggleSelectionMode: () =>
    set((state) => ({
      isSelectionMode: !state.isSelectionMode,
      selectedProjects: [], // Clear selection when toggling mode
    })),
  toggleProjectSelection: (id: string) =>
    set((state) => {
      if (state.selectedProjects.includes(id)) {
        return {
          selectedProjects: state.selectedProjects.filter(
            (projectId) => projectId !== id,
          ),
        };
      } else {
        return { selectedProjects: [...state.selectedProjects, id] };
      }
    }),
  selectAll: (ids: string[]) => set({ selectedProjects: ids }),
  deselectAll: () => set({ selectedProjects: [] }),
  isSelected: (id: string) => get().selectedProjects.includes(id),
}));

type PaperMeta = { authors?: string[]; categories?: string[] };

export default function ProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Access projects from React Query
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  // Access selection state from Zustand store
  const {
    selectedProjects,
    isSelectionMode,
    toggleSelectionMode,
    toggleProjectSelection,
    selectAll,
    deselectAll,
    isSelected,
  } = useProjectSelection();

  const queryClient = useQueryClient();

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return projectId;
    },
    onSuccess: (deletedId) => {
      toast.success("Project deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      deselectAll();
      toggleSelectionMode();
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleNewProject = () => {
    router.push("/project/new");
  };

  const handleProjectClick = (projectId: string) => {
    if (isSelectionMode) {
      toggleProjectSelection(projectId);
    } else {
      router.push(`/project/${projectId}`);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      deselectAll();
    } else {
      selectAll(filteredProjects.map((p) => p.id));
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Type guard for paper
  const hasPaperMeta = (paper: Project["paper"]): paper is PaperMeta => {
    return (
      paper &&
      (Array.isArray((paper as PaperMeta).authors) ||
        Array.isArray((paper as PaperMeta).categories))
    );
  };

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6 h-screen flex flex-col mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#FAF9F6]">
          Your projects
        </h1>
        {isSelectionMode ? (
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleSelectionMode}
              variant="outline"
              className="border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProjects.length === 0) {
                  toast.info("No projects selected");
                  return;
                }
                selectedProjects.forEach((id) =>
                  deleteProjectMutation.mutate(id),
                );
              }}
              variant="destructive"
              disabled={
                selectedProjects.length === 0 || deleteProjectMutation.isPending
              }
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteProjectMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete{" "}
              {selectedProjects.length > 0 && `(${selectedProjects.length})`}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNewProject}
            className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        )}
      </div>

      {projectsLoading ? (
        <div className="flex flex-col space-y-2 flex-1 justify-center py-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 border-2 border-[#E3DACC] dark:border-[#BFB8AC]/30 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 animate-pulse"
            >
              <Skeleton className="h-6 w-1/3 mb-3 rounded bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/20" />
              <Skeleton className="h-4 w-1/2 mb-2 rounded bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-4 w-24 rounded bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10" />
                <Skeleton className="h-4 w-20 rounded bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Alert className="max-w-lg mb-6 bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 border-[#C96442]">
            <AlertDescription className="text-center text-[#262625]/70 dark:text-[#BFB8AC]">
              You haven&apos;t created any projects yet. Start by creating your
              first project!
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleNewProject}
            className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create your first project
          </Button>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#BFB8AC]" />
            <Input
              type="text"
              placeholder="Search your projects..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="pl-10 bg-transparent border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] placeholder:text-[#BFB8AC] rounded-md"
            />
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                You have {projects.length} projects with REM
                {selectedProjects.length > 0 &&
                  isSelectionMode &&
                  ` (${selectedProjects.length} selected)`}
              </p>
              {isSelectionMode ? (
                <button
                  onClick={handleToggleSelectAll}
                  className="text-[#C96442] hover:text-[#C96442]/80 text-sm font-medium focus:outline-none"
                >
                  {selectedProjects.length === filteredProjects.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
              ) : (
                <button
                  onClick={toggleSelectionMode}
                  className="text-[#C96442] hover:text-[#C96442]/80 text-sm font-medium focus:outline-none"
                >
                  Select
                </button>
              )}
            </div>

            <ScrollArea className="flex-1 min-h-0 max-h-full pb-8" ref={containerRef}>
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 bg-transparent",
                      "border-[#E3DACC] dark:border-[#BFB8AC]/30 border-2",
                      "hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/5 hover:border-[#BB5F3F] dark:hover:border-[#BB5F3F]", // added hover brown border
                      "text-[#262625] dark:text-[#FAF9F6]",
                      isSelected(project.id) &&
                        isSelectionMode &&
                        "border-[#C96442] bg-[#C96442]/5 dark:bg-[#C96442]/10",
                    )}
                  >
                    <div className="flex items-start">
                      {isSelectionMode && (
                        <div
                          className="mr-3 mt-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectSelection(project.id);
                          }}
                        >
                          <Checkbox
                            checked={isSelected(project.id)}
                            className={cn(
                              "data-[state=checked]:bg-[#C96442] data-[state=checked]:border-[#C96442]",
                              "border-[#BFB8AC] dark:border-[#BFB8AC]/50",
                              "focus:ring-[#C96442]",
                            )}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-medium text-lg">
                            {project.title}
                          </h3>
                          <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                Created {formatDate(project.createdAt)}
                              </span>
                            </div>
                            {project.paper && hasPaperMeta(project.paper) && (
                              <>
                                {project.paper.authors && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[200px]">
                                      {project.paper.authors
                                        .slice(0, 2)
                                        .join(", ")}
                                      {project.paper.authors.length > 2 &&
                                        " et al."}
                                    </span>
                                  </div>
                                )}
                                {project.paper.categories && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[150px]">
                                      {project.paper.categories
                                        .slice(0, 2)
                                        .join(", ")}
                                      {project.paper.categories.length > 2 &&
                                        "..."}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
