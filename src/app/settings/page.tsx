"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sidebar } from "@/components/project/sidebar";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/auth-hooks";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSignOut } from "@/hooks/auth-hooks";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { isLoading } = useRequireAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useSignOut();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F6] dark:bg-[#262625]">
        <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-screen",
        "bg-[#FAF9F6] dark:bg-[#262625]",
        "flex flex-col",
      )}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 overflow-auto p-6",
            sidebarCollapsed ? "ml-20" : "ml-64",
            "bg-[#FAF9F6] dark:bg-[#262625] min-h-screen",
          )}
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#FAF9F6]">
                Settings
              </h1>
              <Button
                className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] px-4 font-semibold border-none shadow"
                onClick={() => router.push("/project/new")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <Separator className="bg-[#E3DACC] dark:bg-[#BFB8AC]/30 h-[2px] w-full mb-8" />
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10 border border-[#C96442] dark:border-[#C96442] rounded-lg px-0">
                <TabsTrigger
                  value="profile"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="apis"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  APIs
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  Other
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white dark:bg-[#262625] rounded-lg shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30 relative min-h-[320px]">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                    <Avatar className="h-32 w-32 mb-4 border-4 border-[#E3DACC] dark:border-[#BFB8AC]/30 shadow-lg">
                      <AvatarImage
                        src={user?.image || undefined}
                        alt={user?.name || user?.email || "User"}
                      />
                      <AvatarFallback className="text-4xl bg-[#E3DACC] dark:bg-[#BFB8AC]/10 text-[#C96442] dark:text-[#BFB8AC]">
                        {user?.name?.[0]?.toUpperCase() ||
                          user?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* User Info */}
                  <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
                    <div className="text-2xl font-bold text-[#262625] dark:text-[#FAF9F6]">
                      {user?.name || "No Name"}
                    </div>
                    <div className="text-lg text-[#C96442] dark:text-[#BFB8AC] font-medium">
                      {user?.email}
                    </div>
                    <div className="text-sm text-[#BFB8AC] dark:text-[#E3DACC]">
                      User ID: <span className="font-mono">{user?.id}</span>
                    </div>
                  </div>
                  {/* Logout Button */}
                  <Button
                    onClick={() => signOut.mutate()}
                    className="absolute bottom-6 right-6 bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] px-6 py-2 rounded-lg flex items-center gap-2 shadow font-semibold"
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="appearance">
                <div className="p-6 bg-white dark:bg-[#262625] rounded-lg shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                  Appearance Settings (coming soon)
                </div>
              </TabsContent>
              <TabsContent value="apis">
                <div className="p-6 bg-white dark:bg-[#262625] rounded-lg shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                  API Settings (coming soon)
                </div>
              </TabsContent>
              <TabsContent value="other">
                <div className="p-6 bg-white dark:bg-[#262625] rounded-lg shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30">
                  Other Settings (coming soon)
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
