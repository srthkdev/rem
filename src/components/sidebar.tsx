"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  Plus, 
  Settings, 
  LogOut, 
  ChevronDown,
  UserCircle,
  Menu,
  PanelLeftClose,
  MessageCircle,
  CircleEllipsis,
  LayoutDashboard,
  Moon,
  Sun,
  LaptopIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/store/auth-store"
import { toast } from "sonner"
import { signOut } from "@/lib/auth-client"

interface ProjectProps {
  id: string
  name: string
  route: string
  lastMessage?: string
  daysAgo?: number
}

const RECENT_PROJECTS: ProjectProps[] = [
  { id: "1", name: "AI-Powered Form Builder Names", route: "/project/1", lastMessage: "Last message 7 days ago" },
  { id: "2", name: "Personalized Driving Instruction for All Levels", route: "/project/2", lastMessage: "Last message 11 days ago" },
  { id: "3", name: "Estimating IQ from Conversation", route: "/project/3", lastMessage: "Last message 12 days ago" },
  { id: "4", name: "AI Agent to Implement ArXiv Papers and Explain in Blog Posts", route: "/project/4", lastMessage: "Last message 15 days ago" },
  { id: "5", name: "Scrabble-Style Word Game", route: "/project/5", lastMessage: "Last message 19 days ago" },
  { id: "6", name: "Resolving Celery Import Errors in Python", route: "/project/6", lastMessage: "Last message 21 days ago" },
]

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()
  const [isRecentsOpen, setIsRecentsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [recentProjects, setRecentProjects] = useState<ProjectProps[]>(RECENT_PROJECTS)

  // Notify parent component when sidebar is collapsed/expanded
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        toast.success("Signed out successfully")
        router.push("/")
      } else {
        toast.error("Failed to sign out")
      }
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  const toggleRecents = () => {
    setIsRecentsOpen(!isRecentsOpen);
  }

  return (
    <>
      {/* Toggle sidebar button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "fixed left-0 top-4 z-50 h-8 w-8 rounded-full transition-all duration-300",
          isCollapsed ? "left-4" : "left-56",
          "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 hover:bg-[#E3DACC]/50 dark:hover:bg-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:text-[#262625] dark:hover:text-[#FAF9F6]"
        )}
      >
        {isCollapsed ? (
          <Menu className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className={cn(
        "flex flex-col h-screen bg-[#FAF9F6] dark:bg-[#262625] text-[#262625] dark:text-[#FAF9F6] border-r border-[#E3DACC] dark:border-[#BFB8AC]/30",
        "fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-0 opacity-0 -translate-x-full" : "w-64 opacity-100 translate-x-0"
      )}>
        {/* Sidebar Header - REM Logo */}
        <div className="flex items-center h-14 px-5 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30">
          <Link href="/" className="flex items-baseline space-x-1">
            <span className="font-[family-name:var(--font-instrument-serif)] text-3xl font-bold text-[#C96442]">REM</span>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className="px-3 py-2">
          <Button 
            onClick={() => router.push('/project/new')}
            className="w-full bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] flex items-center justify-center gap-2 rounded-full"
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </Button>
        </div>

        
        <div className="px-3 pb-1">
          <Button
            variant="outline"
            onClick={() => router.push("/project")}
            className="w-full justify-start text-sm text-[#262625] dark:text-[#FAF9F6] bg-transparent border-[#E3DACC] dark:border-[#BFB8AC]/30 hover:bg-[#E3DACC]/30 hover:text-[#262625] dark:hover:bg-[#BFB8AC]/10 rounded-full"
          >
            <MessageCircle className="mr-2 h-3.5 w-3.5" />
            <span>Projects</span>
          </Button>
        </div>

        {/* Dashboard Button */}
        <div className="px-3 pb-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="w-full justify-start text-sm text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </div>

        {/* Recents Header */}
        <div className="px-3 pt-1 pb-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-[family-name:var(--font-work-sans)] font-semibold text-[#262625]/70 dark:text-[#BFB8AC]">Recents</h2>
            <button 
              onClick={toggleRecents}
              className="text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] p-1 rounded-md focus:outline-none"
            >
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform", 
                  isRecentsOpen ? "transform rotate-0" : "transform rotate-180"
                )} 
              />
            </button>
          </div>
        </div>

        {/* Recent Projects */}
        {isRecentsOpen && (
          <ScrollArea className="flex-1 px-2">
            <div className="flex flex-col space-y-1 py-1">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <Button
                    key={project.id}
                    asChild
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-start justify-start h-auto py-2 px-3 rounded-md",
                      pathname === project.route 
                        ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6] border-l-2 border-[#C96442] hover:text-[#262625] dark:hover:text-[#FAF9F6]" 
                        : "hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6]"
                    )}
                  >
                    <Link href={project.route} className="w-full text-left">
                      <div className="truncate text-sm font-medium">{project.name}</div>
                    </Link>
                  </Button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                  <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-3">No projects yet</p>
                  <Button 
                    onClick={() => router.push('/project/new')}
                    variant="outline" 
                    size="sm"
                    className="bg-transparent border-[#C96442] text-[#C96442] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442]"
                  >
                    Create your first project
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}


        {/* User Profile */}
        <div className="px-3 py-3 mt-auto border-t border-[#E3DACC] dark:border-[#BFB8AC]/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-between w-full hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6] px-2 h-10">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-[#C96442] text-[#FAF9F6] text-xs">
                      {user?.name ? getInitials(user.name) : user?.email ? getInitials(user.email.split('@')[0]) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium truncate max-w-[160px] text-left">
                      {user?.name || user?.email?.split('@')[0] || "User"}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-[#262625]/70 dark:text-[#BFB8AC]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-[#FAF9F6] dark:bg-[#262625] border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6]">
              <DropdownMenuItem onClick={() => router.push('/settings')} className="text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile')} className="text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              {/* Theme Toggle */}
              <Separator className="my-1 bg-[#E3DACC] dark:bg-[#BFB8AC]/30" />
              <DropdownMenuItem onClick={() => setTheme('light')} className={cn(
                "text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                theme === 'light' && "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10"
              )}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className={cn(
                "text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                theme === 'dark' && "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10"
              )}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className={cn(
                "text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                theme === 'system' && "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10"
              )}>
                <LaptopIcon className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
              
              <Separator className="my-1 bg-[#E3DACC] dark:bg-[#BFB8AC]/30" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500 !data-[highlighted]:text-red-600 dark:text-red-400 hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-red-600 dark:hover:text-red-300 hover:border-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
} 