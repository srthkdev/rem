"use client"

import React, { ReactNode, useState } from "react"
import { Sidebar } from "@/components/project/sidebar"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useRequireAuth } from "@/hooks/auth-hooks"

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useRequireAuth()
  const { theme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F6] dark:bg-[#262625]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative min-h-screen",
      "bg-[#FAF9F6] dark:bg-[#262625]",
      "flex flex-col" 
    )}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-auto p-6",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}>
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 