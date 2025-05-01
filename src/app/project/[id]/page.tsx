"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PDFViewer } from "@/components/shared/pdf-viewer"
import { AIPaperAnalysis } from "@/components/paper-analysis/ai-paper-analysis"
import { useProjectStore } from "@/lib/store/project-store"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, User, Maximize2, Minimize2, ExternalLink, Tag, FileText, Quote, Link2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { ResizeablePanel, ResizeableHandle } from "@/components/ui/resizeable"
import * as ResizeablePrimitive from "react-resizable-panels"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [expandedView, setExpandedView] = useState<"pdf" | "ai" | null>(null)
  const [usePDFFallback, setUsePDFFallback] = useState(false)
  const [useGoogleViewer, setUseGoogleViewer] = useState(false)
  
  // Get project from store
  const { getProject } = useProjectStore()
  const project = getProject(id)
  
  useEffect(() => {
    if (!project && !loading) {
      toast.error("Project not found")
      router.push("/project")
    } else {
      setLoading(false)
    }
  }, [project, router, loading])
  
  // Auto-switch to direct view if we detect loading issues
  useEffect(() => {
    // After 5 seconds, if PDF is still struggling to load, auto-switch to direct view
    if (project && project.paper && project.paper.pdfUrl && !usePDFFallback) {
      const timer = setTimeout(() => {
        setUsePDFFallback(true)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [project, usePDFFallback])
  
  // Update on initial load to ensure layout is correct
  useEffect(() => {
    function updateSidebarClass() {
      const sidebar = document.querySelector('aside');
      
      // Directly update the body class based on sidebar state
      if (sidebar && sidebar.classList.contains('sidebar-collapsed')) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
    
    // Run immediately on component mount
    updateSidebarClass();
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  const handleBack = () => {
    router.push("/project")
  }

  const toggleExpandView = (section: "pdf" | "ai") => {
    setExpandedView(expandedView === section ? null : section)
  }
  
  // Add paper categories if not present
  const defaultCategories = ["Machine Learning", "Neural Networks", "Computer Vision"]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (!project) {
    return null // This will be handled by the useEffect
  }
  
  return (
    <main className="project-detail-layout bg-[#FAF9F6] dark:bg-[#262625]">
      {/* Header with project info */}
      <header className="flex-shrink-0 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-[#FAF9F6] dark:bg-[#262625] z-10 shadow-sm">
        <div className="flex items-start p-3 gap-4">
          {/* Left section: Back button, Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="flex-shrink-0 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-[#262625] dark:text-[#FAF9F6] truncate">
                  {project.title}
                </h1>
                {project.description && (
                  <div className="flex items-center gap-2 mt-1">
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-[#C96442]" />
                    <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] font-[family-name:var(--font-work-sans)] truncate">
                      {project.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle section: Categories */}
          {project.paper?.categories && project.paper.categories.length > 0 && (
            <div className="hidden md:flex flex-col items-center justify-center min-w-[200px]">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-[#C96442]" />
                <div className="flex flex-wrap gap-2 text-xs justify-center">
                  {project.paper.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded-full bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/20 text-[#262625]/70 dark:text-[#BFB8AC]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right section: Authors and Date */}
          {project.paper && (
            <div className="hidden lg:flex flex-col items-end gap-2 text-sm text-[#262625]/70 dark:text-[#BFB8AC]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#C96442]" />
                <span>{formatDate(new Date(project.paper.publishedDate))}</span>
              </div>
              {project.paper.authors && project.paper.authors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#C96442]" />
                  <div className="max-w-[300px] truncate">
                    {project.paper.authors.slice(0, 2).join(", ")}
                    {project.paper.authors.length > 2 && " et al."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content Area - Takes remaining height */}
      <div className="project-detail-content">
        <ResizeablePrimitive.PanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* PDF Viewer */}
          <ResizeablePanel 
            defaultSize={60}
            minSize={30}
            className={cn(
              "h-full border-r border-[#E3DACC] dark:border-[#BFB8AC]/30",
              expandedView === "pdf" ? "flex-1" : (
                expandedView === "ai" ? "hidden lg:block lg:w-0 overflow-hidden" : ""
              )
            )}
          >
            <div className="relative flex flex-col h-full w-full overflow-hidden">
              
              
              {project.paper?.pdfUrl ? (
                usePDFFallback ? (
                  <div className="relative h-full w-full bg-white flex flex-col">
                    <div className="absolute top-2 left-2 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUseGoogleViewer(!useGoogleViewer)}
                        className="h-8 px-2 bg-white/90 backdrop-blur-sm dark:bg-[#262625]/90 border-[#E3DACC] dark:border-[#BFB8AC]/30 shadow-sm"
                      >
                        {useGoogleViewer ? "Use Direct View" : "Try Google Viewer"}
                      </Button>
                    </div>
                    {useGoogleViewer ? (
                      <iframe 
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(project.paper?.pdfUrl || '')}&embedded=true`}
                        className="w-full h-full border-0"
                        title={`${project.title} - Google Docs Viewer`}
                      />
                    ) : (
                      <iframe
                        src={project.paper?.pdfUrl}
                        className="w-full h-full border-0"
                        title={`${project.title} - Direct PDF View`}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-full relative w-full">
                    <div className="absolute top-2 left-2 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsePDFFallback(true)}
                        className="h-8 px-2 bg-white/90 backdrop-blur-sm dark:bg-[#262625]/90 border-[#E3DACC] dark:border-[#BFB8AC]/30 shadow-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Use Direct View
                      </Button>
                    </div>
                    {(expandedView === "pdf" || (!expandedView && expandedView !== "ai")) && (
                      <PDFViewer 
                        url={project.paper?.pdfUrl} 
                        onFallbackRequest={() => setUsePDFFallback(true)}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[#262625]/70 dark:text-[#BFB8AC]">
                    No PDF available for this project
                  </p>
                </div>
              )}
            </div>
          </ResizeablePanel>

          {!expandedView && (
            <ResizeableHandle withHandle />
          )}
          
          {/* AI Analysis */}
          <ResizeablePanel 
            defaultSize={40}
            minSize={30}
            className={cn(
              "h-full",
              expandedView === "ai" ? "flex-1" : (
                expandedView === "pdf" ? "hidden lg:block lg:w-0 overflow-hidden" : ""
              )
            )}
          >
            <div className="relative flex flex-col h-full w-full overflow-hidden">
              
              <AIPaperAnalysis 
                userQuery={project.description} 
                paperTitle={project.paper ? project.paper.title : project.title} 
              />
            </div>
          </ResizeablePanel>
        </ResizeablePrimitive.PanelGroup>
      </div>
    </main>
  )
} 