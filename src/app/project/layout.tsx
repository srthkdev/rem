"use client"

import React, { ReactNode, useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { toast } from "sonner"

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      toast.error("Please sign in to access this page")
      router.push("/auth/sign-in")
    }
  }, [isLoading, user, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // If no user and not loading, don't render anything (will redirect)
  if (!user && !isLoading) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'pl-0' : 'pl-64'}`}>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
} 