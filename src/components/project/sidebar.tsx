"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  Menu,
  PanelLeftClose,
  MessageCircle,
  LayoutDashboard,
  Moon,
  Sun,
  Laptop,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProjects } from "@/hooks/useProjects";
import { useSignOut } from "@/hooks/auth-hooks";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectProps {
  id: string;
  name: string;
  route: string;
  lastMessage?: string;
  daysAgo?: number;
}

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  onCollapse,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const signOut = useSignOut();
  const [isRecentsOpen, setIsRecentsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? false);

  // Check if user is available, if not redirect to login
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      console.log("Sidebar: No authenticated user found, redirecting to login");
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, router]);

  // Update internal state when collapsed prop changes
  useEffect(() => {
    if (collapsed !== undefined) {
      setIsCollapsed(collapsed);
    }
  }, [collapsed]);

  // Add body class for collapsed state
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
    return () => {
      document.body.classList.remove("sidebar-collapsed");
    };
  }, [isCollapsed]);

  // Notify parent component when sidebar is collapsed/expanded
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut.mutate();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);

    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const toggleRecents = () => {
    setIsRecentsOpen(!isRecentsOpen);
  };

  // Sort projects by creation date
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Show Sonner toast and loading spinner while loading projects
  useEffect(() => {
    let toastId: string | number | undefined;
    if (projectsLoading) {
      toastId = toast.loading("Loading your projects...");
    } else {
      toast.dismiss();
    }
    return () => {
      toast.dismiss();
    };
  }, [projectsLoading]);

  return (
    <>
      {/* Toggle sidebar button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "fixed left-0 top-2 z-50 h-8 w-8 rounded-full transition-all duration-300",
          isCollapsed ? "left-8" : "left-56",
          "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 hover:bg-[#E3DACC]/50 dark:hover:bg-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] hover:text-[#262625] dark:hover:text-[#FAF9F6]",
        )}
      >
        {isCollapsed ? (
          <Menu className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Collapsed Sidebar */}
      {isCollapsed && (
        <div className="fixed left-0 top-0 z-40 flex flex-col items-center w-12 h-screen bg-[#FAF9F6] dark:bg-[#262625] border-r border-[#E3DACC] dark:border-[#BFB8AC]/30">
          {/* Logo */}
          <div className="flex items-center justify-center h-14 border-b w-full border-[#E3DACC] dark:border-[#BFB8AC]/30">
            <Link href="/" className="flex items-center justify-center">
              <span className="font-[family-name:var(--font-instrument-serif)] text-2xl font-bold text-[#C96442]">
                R
              </span>
            </Link>
          </div>

          {/* Main icons */}
          <div className="flex flex-col items-center space-y-3 w-full mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/project/new")}
              className={cn(
                "h-8 w-8 rounded-full",
                pathname === "/project/new"
                  ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10"
                  : "",
                "text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
              )}
              title="New Project"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/project")}
              className={cn(
                "h-8 w-8 rounded-full",
                pathname === "/project" ||
                  (pathname.startsWith("/project/") &&
                    pathname !== "/project/new")
                  ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10"
                  : "",
                "text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
              )}
              title="Projects"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className={cn(
                "h-8 w-8 rounded-full",
                pathname === "/dashboard"
                  ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10"
                  : "",
                "text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
              )}
              title="Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>

          {/* User Avatar */}
          <div className="mt-auto mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full overflow-hidden hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-[#C96442] text-[#FAF9F6] text-xs">
                      {user?.name
                        ? getInitials(user.name)
                        : user?.email
                          ? getInitials(user.email.split("@")[0])
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#FAF9F6] dark:bg-[#262625] border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6]"
              >
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <Separator className="my-1 bg-[#E3DACC] dark:bg-[#BFB8AC]/30" />
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <Separator className="my-1 bg-[#E3DACC] dark:bg-[#BFB8AC]/30" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 dark:text-red-400 hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Expanded Sidebar */}
      <div
        className={cn(
          "flex flex-col h-screen bg-[#FAF9F6] dark:bg-[#262625] text-[#262625] dark:text-[#FAF9F6] border-r border-[#E3DACC] dark:border-[#BFB8AC]/30",
          "fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out",
          isCollapsed
            ? "w-0 opacity-0 -translate-x-full"
            : "w-64 opacity-100 translate-x-0",
        )}
      >
        {/* Sidebar Header - REM Logo */}
        <div className="flex items-center h-12 px-5 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30">
          <Link href="/" className="flex items-baseline space-x-1">
            <span className="font-[family-name:var(--font-instrument-serif)] text-xl font-bold text-[#C96442]">
              REM
            </span>
          </Link>
        </div>

        <div className="px-3 py-2">
          <Button
            variant={pathname === "/project/new" ? "default" : "ghost"}
            onClick={() => router.push("/project/new")}
            className={cn(
              "w-full justify-start text-sm",
              pathname === "/project/new"
                ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/50 dark:hover:bg-[#BFB8AC]/20"
                : "text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
            )}
          >
            <span className="mr-2 flex items-center justify-center h-6 w-6 bg-[#C96442] rounded-full text-[#FAF9F6]">
              <Plus className="h-4 w-4" />
            </span>
            <span>New Project</span>
          </Button>
        </div>

        <div className="px-3 pb-2">
          <Button
            variant={
              pathname === "/project" ||
              (pathname.startsWith("/project/") && pathname !== "/project/new")
                ? "default"
                : "ghost"
            }
            onClick={() => router.push("/project")}
            className={cn(
              "w-full justify-start text-sm",
              pathname === "/project" ||
                (pathname.startsWith("/project/") &&
                  pathname !== "/project/new")
                ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/50 dark:hover:bg-[#BFB8AC]/20"
                : "text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
            )}
          >
            <span className="mr-2 flex items-center justify-center h-6 w-6 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/20 rounded-full text-[#262625] dark:text-[#FAF9F6]">
              <MessageCircle className="h-4 w-4" />
            </span>
            <span>Projects</span>
          </Button>
        </div>

        {/* Dashboard Button */}
        <div className="px-3 pb-2">
          <Button
            variant={pathname === "/dashboard" ? "default" : "ghost"}
            onClick={() => router.push("/dashboard")}
            className={cn(
              "w-full justify-start text-sm",
              pathname === "/dashboard"
                ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/50 dark:hover:bg-[#BFB8AC]/20"
                : "text-[#262625]/70 dark:text-[#BFB8AC] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
            )}
          >
            <span className="mr-2 flex items-center justify-center h-6 w-6 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/20 rounded-full text-[#262625] dark:text-[#FAF9F6]">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span>Dashboard</span>
          </Button>
        </div>

        {/* Recents Header */}
        <div className="px-3 pt-1 pb-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-[family-name:var(--font-work-sans)] font-semibold text-[#262625]/70 dark:text-[#BFB8AC]">
              Recents
            </h2>
            <button
              onClick={toggleRecents}
              className="text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] p-1 rounded-md focus:outline-none"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isRecentsOpen ? "transform rotate-0" : "transform rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        {/* Recent Projects */}
        {isRecentsOpen && (
          <ScrollArea className="flex-1 px-2">
            <div className="flex flex-col space-y-1 py-1">
              {projectsLoading ? (
                <div className="flex flex-col space-y-2 py-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-start justify-start h-auto py-2 px-3 rounded-md border border-transparent bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 animate-pulse"
                    >
                      <Skeleton className="h-5 w-40 mb-2 rounded bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/20" />
                      <Skeleton className="h-3 w-28 rounded bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10" />
                    </div>
                  ))}
                </div>
              ) : sortedProjects.length > 0 ? (
                sortedProjects.map((project) => (
                  <Button
                    key={project.id}
                    asChild
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-start justify-start h-auto py-2 px-3 rounded-md",
                      "border border-transparent hover:border-[#C96442]/30",
                      pathname === `/project/${project.id}`
                        ? "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6] border-l-2 border-[#C96442] hover:text-[#262625] dark:hover:text-[#FAF9F6]"
                        : "hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                    )}
                  >
                    <Link
                      href={`/project/${project.id}`}
                      className="w-full text-left"
                    >
                      <div className="truncate text-lg font-medium max-w-[220px] font-[family-name:var(--font-instrument-serif)]">
                        {project.title}
                      </div>
                      {project.description && (
                        <div className="truncate text-xs text-[#262625]/50 dark:text-[#BFB8AC]/70 max-w-[220px] mt-0.5">
                          {project.description}
                        </div>
                      )}
                    </Link>
                  </Button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                  <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-3">
                    No projects yet
                  </p>
                  <Button
                    onClick={() => router.push("/project/new")}
                    variant="outline"
                    size="sm"
                    className="dark:bg-[#262625] border-[#C96442] text-[#C96442] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442]"
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
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6] px-2 h-10"
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-[#C96442] text-[#FAF9F6] text-xs">
                      {user?.name
                        ? getInitials(user.name)
                        : user?.email
                          ? getInitials(user.email.split("@")[0])
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium truncate max-w-[160px] text-left">
                      {user?.name || user?.email?.split("@")[0] || "User"}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-[#262625]/70 dark:text-[#BFB8AC]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[200px] bg-[#FAF9F6] dark:bg-[#262625] border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6]"
            >
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings?profile")}
                className="text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              {/* Theme Toggle */}
              <Separator className="my-1 bg-[#E3DACC] dark:bg-[#BFB8AC]/30" />
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={cn(
                  "text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                  theme === "light" && "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10",
                )}
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={cn(
                  "text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                  theme === "dark" && "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10",
                )}
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className={cn(
                  "text-[#262625] !data-[highlighted]:text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#262625] dark:hover:text-[#FAF9F6]",
                  theme === "system" && "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10",
                )}
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>

              <Separator className="my-1 bg-[#E3DACC] dark:bg-[#BFB8AC]/30" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-500 !data-[highlighted]:text-red-600 dark:text-red-400 hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-red-600 dark:hover:text-red-300 hover:border-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
