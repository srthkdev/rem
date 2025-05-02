"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IntroducingRemAI } from "@/components/shared/introducing-rem-ai"
import { searchArxivPapers, getPaperById } from "@/lib/services/arxiv-service"
import { createProject } from "@/lib/services/project-service"
import { ArxivPaper, useProjectStore } from "@/lib/store/project-store"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { PaperSearchGrid } from "@/components/project/paper-search-grid"
import { Search, X, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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

// Add this function at the top level after imports
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good Morning"
  if (hour >= 12 && hour < 17) return "Good Afternoon"
  return "Good Evening"
}

export default function NewProject() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paperId = searchParams.get('paper')
  
  const queryClient = useQueryClient()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [userInput, setUserInput] = useState("")
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null)
  const [searchResults, setSearchResults] = useState<ArxivPaper[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Access project store
  const { addProject } = useProjectStore()

  // Add this state for user's name (you would typically get this from your auth system)
  const [userName, setUserName] = useState("Sarthak") // Replace with actual user name logic

  // Handle paper ID from URL on component mount
  useEffect(() => {
    const fetchPaperFromId = async () => {
      if (paperId) {
        try {
          console.log("Fetching paper with ID:", paperId);
          // Use a simple fetch for arXiv ID to prevent any issues
          const response = await fetch(`https://export.arxiv.org/api/query?id_list=${paperId}`);
          const xmlText = await response.text();
          
          // Simple XML parsing for demonstration
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          
          const entry = xmlDoc.querySelector("entry");
          if (entry) {
            const title = entry.querySelector("title")?.textContent || "";
            const summary = entry.querySelector("summary")?.textContent || "";
            const authors = Array.from(entry.querySelectorAll("author name")).map(name => name.textContent || "");
            const published = entry.querySelector("published")?.textContent || "";
            const pdfUrl = entry.querySelector("link[title='pdf']")?.getAttribute("href") || "";
            
            const paper: ArxivPaper = {
              id: paperId,
              title: title,
              summary: summary,
              authors: authors,
              publishedDate: published,
              pdfUrl: pdfUrl,
              categories: []
            };
            
            setSelectedPaper(paper);
            console.log("Paper found, creating project:", paper.title);
            // Auto-create project with small delay to ensure everything is loaded
            setTimeout(() => {
              handleCreateProject(paper);
            }, 500);
          } else {
            throw new Error("Paper not found");
          }
        } catch (error) {
          console.error("Error fetching paper:", error);
          toast.error("Failed to load paper details. Please try again.");
        }
      }
    };

    fetchPaperFromId();
  }, [paperId]);

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
      setSearchResults([]);
      setSelectedPaper(null);
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
  const handleCreateProject = async (paper: ArxivPaper = selectedPaper!) => {
    if (!paper) return;
    
    try {
      setIsCreating(true);
      
      // Create a new project with the selected paper
      const projectId = uuidv4();
      const newProject = {
        id: projectId,
        title: paper.title,
        description: userInput || query,
        createdAt: new Date(),
        updatedAt: new Date(),
        paper: paper,
        lastMessage: "I've analyzed this paper and I'm ready to help with your research.",
      };

      // Add to store
      addProject(newProject);
      
      // Navigate to the new project
      router.push(`/project/${projectId}`);
      toast.success("Project created successfully!");
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="px-4 pt-16 pb-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col items-center justify-center mt-8 mb-10">
        <IntroducingRemAI />
      </div>
      
      <div className="max-w-3xl mx-auto mt-10 mb-8">
        <div className="flex items-center justify-center gap-2 text-2xl md:text-4xl mb-6">
          <span className="font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#C2C0B6] font-normal">{getGreeting()},</span>
          <span className="font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#C2C0B6] font-normal">{userName}</span>
        </div>
        
        {/* Search Input and Buttons Container */}
        <div className="relative mb-6">
          <div className="w-full max-w-xl mx-auto"> {/* Container to match input width */}
            <div className="relative">
              <PlaceholdersAndVanishInput 
                placeholders={placeholders}
                onChange={handleInputChange}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedPaper) {
                    handleCreateProject(selectedPaper);
                  }
                }}
                className="bg-white dark:bg-[#1C1C1C] border-[#E3DACC] dark:border-[#BFB8AC]/30 focus:border-[#C96442] dark:focus:border-[#C96442]"
              />
            </div>
            <div className="flex justify-between items-center mt-3 px-6 md:px-4">
              {query && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setQuery("")
                    setSearchResults([]);
                    setSelectedPaper(null);
                  }}
                  className="h-9 w-9 text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] hover:bg-transparent flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              {!query && <div className="h-9 w-9" />} {/* Placeholder for spacing */}
              {selectedPaper && (
                <Button
                  onClick={() => handleCreateProject(selectedPaper)}
                  disabled={isCreating}
                  size="sm"
                  className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] h-9 rounded-full text-sm px-4 flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-center gap-4">
          <p className="text-sm text-neutral-400">
            Powered by AI • 1M+ papers • Personalized learning
          </p>
        </div>
        
        {/* Search Results Grid */}
        {(debouncedQuery.length >= 3 || searchResults.length > 0) && (
          <div className={cn(
            "mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#C96442] scrollbar-track-transparent", 
            debouncedQuery ? "opacity-100" : "opacity-0 pointer-events-none",
            "max-h-[calc(100vh-360px)]" // Increased visible area
          )}>
            <div className="min-h-[calc(100vh-360px)] pb-16"> {/* Ensure minimum height and extra padding */}
              {isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="relative p-4 border border-[#E3DACC] dark:border-[#BFB8AC]/30 rounded-lg hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/5 transition-colors duration-200">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                        <Skeleton className="h-16 w-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4 rounded-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                            <Skeleton className="h-4 w-20 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4 rounded-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                            <Skeleton className="h-4 w-24 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <PaperSearchGrid
                  papers={searchResults.slice(0, 9)}
                  isLoading={isSearching}
                  selectedPaper={selectedPaper}
                  onSelect={handleSelectPaper}
                  onCreateProject={handleCreateProject}
                  isCreating={isCreating}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
