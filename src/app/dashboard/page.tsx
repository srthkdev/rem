"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sidebar } from "@/components/project/sidebar";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/auth-hooks";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isLoading } = useRequireAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
          )}
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#FAF9F6]">
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

            <div className="grid gap-6 mb-6">
              <Card className="border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-white dark:bg-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Stats</CardTitle>
                  <CardDescription>
                    Your research project metrics at a glance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#FAF9F6] dark:bg-[#262625] rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Projects
                      </p>
                      <p className="text-3xl font-semibold">8</p>
                    </div>
                    <div className="p-4 bg-[#FAF9F6] dark:bg-[#262625] rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        References
                      </p>
                      <p className="text-3xl font-semibold">32</p>
                    </div>
                    <div className="p-4 bg-[#FAF9F6] dark:bg-[#262625] rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Summaries
                      </p>
                      <p className="text-3xl font-semibold">15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-white dark:bg-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest research updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b border-[#E3DACC] dark:border-[#BFB8AC]/30 pb-3"
                      >
                        <div>
                          <p className="font-medium">AI-Powered Form Builder</p>
                          <p className="text-sm text-muted-foreground">
                            Added new paper reference
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {i} day{i !== 1 ? "s" : ""} ago
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
