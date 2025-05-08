"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sidebar } from "@/components/project/sidebar";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/auth-hooks";
import { Plus, Inbox, ScrollText, TrendingUp, LineChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { isLoading } = useRequireAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tab, setTab] = useState<"papers" | "progress" | "trending" | "inbox">(
    "papers",
  );
  const router = useRouter();

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
            "bg-[#FAF9F6] dark:bg-[#262625]",
          )}
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#FAF9F6]">
                Dashboard
              </h1>
              <Button
                variant="outline"
                className="border-[#E3DACC] dark:border-[#BFB8AC]/30 hover:bg-[#E3DACC]/10 dark:hover:bg-[#BFB8AC]/10"
                onClick={() => router.push("/project/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
            <Separator className="bg-[#E3DACC] dark:bg-[#BFB8AC]/30 h-[2px] w-full mb-8" />
            <Tabs
              value={tab}
              onValueChange={(v) =>
                setTab(v as "papers" | "progress" | "trending" | "inbox")
              }
              className="w-full"
            >
              <TabsList className="mb-6 bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10 border border-[#C96442] dark:border-[#C96442] rounded-lg px-0">
                <TabsTrigger
                  value="papers"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  <ScrollText className="h-4 w-4 mr-2" />
                  Papers Feed
                </TabsTrigger>
                <TabsTrigger
                  value="inbox"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="progress"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="transition-colors duration-200 text-[#C96442] dark:text-[#BFB8AC] data-[state=active]:bg-[#C96442] dark:data-[state=active]:bg-[#262625] data-[state=active]:text-[#FAF9F6] hover:bg-[#E3DACC]/30 dark:hover:bg-[#BFB8AC]/10 hover:text-[#C96442] dark:hover:text-[#FAF9F6] font-semibold"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
              </TabsList>
              <TabsContent value="papers">
                <div className="flex flex-col gap-6 w-full mt-4 bg-white dark:bg-[#262625] rounded-lg p-8 shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30 max-h-[80vh] overflow-auto pb-12">
                  <h2 className="text-2xl font-bold mb-2 text-[#C96442] dark:text-[#BFB8AC]">
                    Papers Feed
                  </h2>
                  <p className="text-muted-foreground">
                    Your latest research papers and updates will appear here.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="progress">
                <div className="flex flex-col gap-6 w-full mt-4 bg-white dark:bg-[#262625] rounded-lg p-8 shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30 max-h-[80vh] overflow-auto pb-12">
                  <h2 className="text-2xl font-bold mb-2 text-[#C96442] dark:text-[#BFB8AC]">
                    Progress
                  </h2>
                  <p className="text-muted-foreground">
                    Your project progress and milestones will appear here.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="trending">
                <div className="flex flex-col gap-6 w-full mt-4 bg-white dark:bg-[#262625] rounded-lg p-8 shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30 max-h-[80vh] overflow-auto pb-12">
                  <h2 className="text-2xl font-bold mb-2 text-[#C96442] dark:text-[#BFB8AC]">
                    Trending
                  </h2>
                  <p className="text-muted-foreground">
                    Trending research and hot topics will appear here.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="inbox">
                <div className="flex flex-col gap-6 w-full mt-4 bg-white dark:bg-[#262625] rounded-lg p-8 shadow border border-[#E3DACC] dark:border-[#BFB8AC]/30 max-h-[80vh] overflow-auto pb-12">
                  <h2 className="text-2xl font-bold mb-2 text-[#C96442] dark:text-[#BFB8AC]">
                    Inbox
                  </h2>
                  <p className="text-muted-foreground">
                    Your messages and notifications will appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
