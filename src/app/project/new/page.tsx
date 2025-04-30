"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IntroducingRemAI } from "@/components/introducing-rem-ai"
import { searchArxivPapers } from "@/lib/services/arxiv-service"
import { ArxivPaper, useProjectStore } from "@/lib/store/project-store"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { PaperSearchGrid } from "@/components/paper-search-grid"
import { Search, X, Sparkles } from "lucide-react"

// Placeholder texts for paper search input
const placeholders = [
  "Search for papers on quantum computing...",
  "Find research about machine learning...",
  "Look up papers on climate change...",
  "Search for neural networks...",
  "Explore research in computer vision...",
  "Find papers on genomics and DNA sequencing...",
]

// Search schema for validation
const searchSchema = z.object({
  query: z.string().min(3, {
    message: "Search query must be at least 3 characters.",
  }),
})

type SearchFormValues = z.infer<typeof searchSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [userInput, setUserInput] = useState("")

  // Access project store
  const {
    searchResults,
    setSearchResults,
    selectedPaper,
    setSelectedPaper,
    addProject,
    clearSearchResults,
  } = useProjectStore()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        setDebouncedQuery(query)
        setUserInput(query) // Save user input for project creation
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Search query for ArXiv papers
  const { isLoading: isSearching, data: searchData } = useQuery({
    queryKey: ["arxivSearch", debouncedQuery],
    queryFn: async () => {
      try {
        if (debouncedQuery.length < 3) return []
        const papers = await searchArxivPapers(debouncedQuery)
        return papers
      } catch (error) {
        console.error("Error searching papers:", error)
        toast.error("Failed to search papers. Please try again.")
        return []
      }
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
  
  // Update search results when data changes
  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData)
    }
  }, [searchData, setSearchResults])

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPaper) {
        throw new Error("No paper selected")
      }

      // Create a new project with the selected paper
      const projectId = uuidv4()
      const newProject = {
        id: projectId,
        title: selectedPaper.title,
        description: userInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        paper: selectedPaper,
        lastMessage: "I've analyzed this paper and I'm ready to help with your research.",
      }

      addProject(newProject)
      return projectId
    },
    onSuccess: (projectId) => {
      toast.success("Project created successfully!")
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      router.push(`/project/${projectId}`)
    },
    onError: () => {
      toast.error("Failed to create project. Please try again.")
    },
  })

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    
    // Clear results if input is empty
    if (!newValue.trim()) {
      clearSearchResults()
    }
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.length >= 3) {
      setDebouncedQuery(query)
      setUserInput(query)
    }
  }

  // Handle paper selection
  const handleSelectPaper = (paper: ArxivPaper) => {
    setSelectedPaper(paper)
  }

  // Handle project creation
  const handleCreateProject = () => {
    if (selectedPaper) {
      createProjectMutation.mutate()
    } else {
      toast.error("Please select a paper first")
    }
  }

  return (
    <div className="px-4 pt-16 pb-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col items-center justify-center mt-8 mb-10">
        <IntroducingRemAI />
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-7xl font-bold text-[#C96442] pt-10">Rem: </h2>
        <h3 className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-7xl font-bold text-[#C96442] dark:text-[white]">Research Made Accessible</h3>
      </div>
      
      <div className="max-w-5xl mx-auto mt-10 mb-8">
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="relative">
            <PlaceholdersAndVanishInput 
              placeholders={placeholders}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {selectedPaper && (
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  size="sm"
                  className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] h-8 rounded-full text-xs px-3 flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Create Project
                </Button>
              )}
              {query && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setQuery("")
                    clearSearchResults()
                  }}
                  className="h-7 w-7 text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] hover:bg-transparent flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Results Grid */}
        {(debouncedQuery.length >= 3 || searchResults.length > 0) && (
          <div className={cn(
            "mt-6 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#C96442] scrollbar-track-transparent", 
            debouncedQuery ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <PaperSearchGrid
              papers={searchResults}
              isLoading={isSearching}
              selectedPaper={selectedPaper}
              onSelect={handleSelectPaper}
              onCreateProject={handleCreateProject}
              isCreating={createProjectMutation.isPending}
            />
          </div>
        )}
        
        <div className="mt-8 flex items-center justify-center gap-4">
          <p className="text-sm text-neutral-400">
            Powered by AI • 1M+ papers • Personalized learning
          </p>
        </div>
      </div>
    </div>
  )
}
