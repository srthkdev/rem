"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"
import { create } from "zustand"
import { cn } from "@/lib/utils"

// Define project type with Zod Schema
const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  lastMessage: z.string(),
  daysAgo: z.number(),
})

type Project = z.infer<typeof ProjectSchema>

// Create Zustand store for selection state
interface ProjectSelectionState {
  selectedProjects: string[]
  isSelectionMode: boolean
  toggleSelectionMode: () => void
  toggleProjectSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  deselectAll: () => void
  isSelected: (id: string) => boolean
}

const useProjectSelection = create<ProjectSelectionState>((set, get) => ({
  selectedProjects: [],
  isSelectionMode: false,
  toggleSelectionMode: () => set(state => ({ 
    isSelectionMode: !state.isSelectionMode,
    selectedProjects: [] // Clear selection when toggling mode
  })),
  toggleProjectSelection: (id: string) => set(state => {
    if (state.selectedProjects.includes(id)) {
      return { selectedProjects: state.selectedProjects.filter(projectId => projectId !== id) }
    } else {
      return { selectedProjects: [...state.selectedProjects, id] }
    }
  }),
  selectAll: (ids: string[]) => set({ selectedProjects: ids }),
  deselectAll: () => set({ selectedProjects: [] }),
  isSelected: (id: string) => get().selectedProjects.includes(id)
}))

// Mock API function - would be replaced with a real API call
const fetchProjects = async (): Promise<Project[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Return mock data
  return [
    { id: "1", title: "AI-Powered Form Builder Names", lastMessage: "Last message", daysAgo: 7 },
    { id: "2", title: "Personalized Driving Instruction for All Levels", lastMessage: "Last message", daysAgo: 11 },
    { id: "3", title: "Estimating IQ from Conversation", lastMessage: "Last message", daysAgo: 12 },
    { id: "4", title: "AI Agent to Implement ArXiv Papers and Explain in Blog Posts", lastMessage: "Last message", daysAgo: 15 },
    { id: "5", title: "Scrabble-Style Word Game", lastMessage: "Last message", daysAgo: 19 },
    { id: "6", title: "Resolving Celery Import Errors in Python", lastMessage: "Last message", daysAgo: 21 },
  ]
}

// Mock API function to delete projects
const deleteProjects = async (ids: string[]): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate success
  return true
}

export default function ProjectsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Access selection state from Zustand store
  const { 
    selectedProjects, 
    isSelectionMode, 
    toggleSelectionMode, 
    toggleProjectSelection, 
    selectAll,
    deselectAll,
    isSelected
  } = useProjectSelection()
  
  // Fetch projects with React Query
  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })
  
  // Delete mutation with TanStack Query
  const deleteMutation = useMutation({
    mutationFn: deleteProjects,
    onSuccess: () => {
      toast.success(`${selectedProjects.length} project${selectedProjects.length !== 1 ? 's' : ''} deleted successfully`)
      deselectAll()
      toggleSelectionMode()
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      toast.error("Failed to delete projects")
    }
  })
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleNewProject = () => {
    router.push("/project/new")
  }
  
  const handleProjectClick = (projectId: string) => {
    if (isSelectionMode) {
      toggleProjectSelection(projectId)
    } else {
      router.push(`/project/${projectId}`)
    }
  }
  
  const handleToggleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      deselectAll()
    } else {
      selectAll(filteredProjects.map(p => p.id))
    }
  }
  
  const handleDeleteSelected = () => {
    if (selectedProjects.length === 0) {
      toast.info("No projects selected")
      return
    }
    
    deleteMutation.mutate(selectedProjects)
  }

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6 h-full flex flex-col mx-auto pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#FAF9F6]">
          Your projects
        </h1>
        {isSelectionMode ? (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              disabled={selectedProjects.length === 0 || deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete {selectedProjects.length > 0 && `(${selectedProjects.length})`}
            </Button>
            <Button
              onClick={toggleSelectionMode}
              variant="outline"
              className="border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
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
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#BFB8AC]" />
        <Input
          type="text"
          placeholder="Search your projects..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="pl-10 bg-transparent border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] placeholder:text-[#BFB8AC] rounded-md"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load projects</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-[#E3DACC] dark:border-[#BFB8AC]/30">
            Try again
          </Button>
        </div>
      ) : (
        <>
          {projects.length > 0 ? (
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                  You have {projects.length} projects with REM 
                  {selectedProjects.length > 0 && isSelectionMode && ` (${selectedProjects.length} selected)`}
                </p>
                {isSelectionMode ? (
                  <button 
                    onClick={handleToggleSelectAll}
                    className="text-[#C96442] hover:text-[#C96442]/80 text-sm font-medium focus:outline-none"
                  >
                    {selectedProjects.length === filteredProjects.length ? "Deselect all" : "Select all"}
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
              
              <ScrollArea className="flex-grow" ref={containerRef}>
                <div className="space-y-2 pr-4">
                  {filteredProjects.map((project) => (
                    <Card 
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200 bg-transparent",
                        "border-[#E3DACC] dark:border-[#BFB8AC]/30",
                        "hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/5",
                        "text-[#262625] dark:text-[#FAF9F6]",
                        isSelected(project.id) && isSelectionMode && "border-[#C96442] bg-[#C96442]/5 dark:bg-[#C96442]/10"
                      )}
                    >
                      <div className="flex items-start">
                        {isSelectionMode && (
                          <div 
                            className="mr-3 mt-0.5" 
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleProjectSelection(project.id)
                            }}
                          >
                            <Checkbox 
                              checked={isSelected(project.id)}
                              className={cn(
                                "data-[state=checked]:bg-[#C96442] data-[state=checked]:border-[#C96442]",
                                "border-[#BFB8AC] dark:border-[#BFB8AC]/50",
                                "focus:ring-[#C96442]"
                              )} 
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{project.title}</h3>
                          <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mt-1">
                            {project.lastMessage} {project.daysAgo} days ago
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FAF9F6]/5 dark:bg-[#262625]/5 rounded-lg border border-dashed border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <h3 className="text-xl font-medium mb-2 text-[#262625] dark:text-[#FAF9F6]">No projects yet</h3>
              <p className="text-[#262625]/70 dark:text-[#BFB8AC] mb-6 max-w-sm mx-auto">
                Start your first project with REM to begin exploring research together.
              </p>
              <Button
                onClick={handleNewProject}
                className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6]"
              >
                Start a new project
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 