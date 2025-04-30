"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { IntroducingRemAI } from "@/components/introducing-rem-ai";
import { ArxivSearchInput } from "@/components/ui/arxiv-search-input"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"

// Placeholder texts for project input
const placeholders = [
  "What research topic are you interested in exploring?",
  "What scientific question would you like to investigate?",
  "Describe the topic you'd like to research...",
  "What field of study are you focusing on?",
  "What specific problem are you trying to solve?",
];

// Project schema for form validation
const projectSchema = z.object({
  description: z.string().min(10, {
    message: "Project description must be at least 10 characters.",
  }),
})

type ProjectFormValues = z.infer<typeof projectSchema>

// Mock function to create a project - replace with actual API call
const createProject = async (data: ProjectFormValues): Promise<{ id: string }> => {
  // This would be an API call to create the project
  console.log("Creating project with data:", data)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return mock project ID
  return { id: Math.random().toString(36).substring(2, 9) }
}

export default function NewProjectPage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [useArxivSearch, setUseArxivSearch] = useState(false)
  
  // Form setup with zod validation
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      description: "",
    },
  })
  
  // Get values and state from form
  const { handleSubmit, formState: { errors }, setValue, watch, register } = form
  const description = watch("description")
  
  // Project creation mutation with TanStack Query
  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      toast.success("Project created successfully!")
      router.push(`/project/${data.id}`)
    },
    onError: (error) => {
      console.error("Error creating project:", error)
      toast.error("Failed to create project. Please try again.")
    },
  })
  
  // Handle form submission
  const onSubmit = (data: ProjectFormValues) => {
    mutation.mutate(data)
  }
  
  // Handle textarea height adjustment
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.max(54, textarea.scrollHeight)
      textarea.style.height = `${newHeight}px`
    }
  }
  
  // Update textarea height when content changes
  React.useEffect(() => {
    adjustTextareaHeight()
  }, [description])
  
  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
  }

  // Handle input change from the PlaceholdersAndVanishInput
  const handleVanishInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("description", e.target.value);
  };

  // Handle form submit from VanishInput
  const handleVanishInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (description && description.length >= 10) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="px-4 pt-16 pb-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col items-center justify-center mt-8 mb-10">
        <IntroducingRemAI />
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-7xl font-bold text-[#C96442] pt-10">Rem: </h2>
        <h3 className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-7xl font-bold text-white">Research Made Accessible</h3>
       
      </div>
      
      <div className="max-w-3xl mx-auto mt-10 mb-8">
      
        {useArxivSearch ? (
          <div className="relative">
            <ArxivSearchInput />
            <div className="mt-4 text-center">
              <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
                Find and select a paper to start your research project
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative mb-4">
              <PlaceholdersAndVanishInput 
                placeholders={placeholders}
                onChange={handleVanishInputChange}
                onSubmit={handleVanishInputSubmit}
              />
            </div>
            
            {errors.description && (
              <p className="text-red-500 text-sm mt-2 ml-4">{errors.description.message}</p>
            )}
            
          </form>
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
