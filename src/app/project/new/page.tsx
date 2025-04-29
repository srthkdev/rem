"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"

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

  return (
    <div className="max-w-3xl mx-auto pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a New Project</h1>
        <p className="text-muted-foreground">Describe your project idea and we'll help you bring it to life.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-shrink-0 w-full mx-auto">
          <Card className="border border-alt-stone-200 dark:border-zinc-700 bg-stone-100/50 dark:bg-stone-800/50 rounded-xl shadow-sm backdrop-blur-md overflow-visible">
            <CardContent className="p-0">
              <div className="relative">
                <div className="relative px-3 pt-3" ref={containerRef}>
                  <Textarea
                    {...register("description")}
                    ref={(e) => {
                      register("description").ref(e)
                      // @ts-ignore - Combining refs
                      textareaRef.current = e
                    }}
                    placeholder="What's on your mind tonight?"
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'bg-transparent',
                      'border-none',
                      'focus:ring-0',
                      'focus-visible:border-0 focus-visible:ring-0',
                      'resize-none',
                      'py-3 px-4 min-h-[54px]',
                      'text-alt-stone-900 dark:text-gray-100',
                      'placeholder-alt-stone-400 dark:placeholder-gray-400',
                      'transition-all duration-200 rounded-lg'
                    )}
                    style={{
                      minHeight: '54px',
                      height: 'auto',
                      outline: 'none',
                      border: 'none',
                      boxShadow: 'none'
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!description?.trim() || mutation.isPending}
                    className={cn(
                      'absolute right-5 bottom-2',
                      'bg-alt-green-500 dark:bg-emerald-500',
                      'text-white dark:text-gray-900',
                      'hover:bg-alt-green-600 hover:text-white',
                      'dark:hover:bg-emerald-400 dark:hover:text-gray-900',
                      'h-8 w-8 rounded-full',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      'transition-all duration-200',
                      'focus:ring-2 focus:ring-alt-green-300 dark:focus:ring-emerald-300/60 focus:ring-offset-0',
                      'shadow-sm'
                    )}
                  >
                    {mutation.isPending ? (
                      <span className="h-4 w-4 block rounded-full border-2 border-t-transparent border-current animate-spin"></span>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {errors.description && (
            <p className="text-red-500 text-sm mt-2 ml-4">{errors.description.message}</p>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                // Save as draft logic would go here
                toast.info("Project saved as draft")
              }}
            >
              Save Draft
            </Button>
            <Button 
              type="submit"
              disabled={!description?.trim() || mutation.isPending}
              className="bg-[#C96442] hover:bg-[#C96442]/90"
            >
              {mutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
