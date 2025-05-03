"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Clock, Tag, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  project: Project;
  className?: string;
}

export function ProjectSidebar({ project, className }: ProjectSidebarProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBack = () => {
    router.push("/project");
  };

  return (
    <div
      className={cn(
        "w-full h-full border-r border-[#E3DACC] dark:border-[#BFB8AC]/30 bg-[#FAF9F6] dark:bg-[#262625]",
        className,
      )}
    >
      <div className="flex items-center p-4 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h2 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6] truncate">
          Project
        </h2>
      </div>

      <div className="p-4">
        <h1 className="text-xl font-semibold text-[#262625] dark:text-[#FAF9F6] mb-2">
          {project.title}
        </h1>

        {project.description && (
          <p className="text-sm text-[#262625]/70 dark:text-[#BFB8AC] mb-4">
            {project.description}
          </p>
        )}

        <div className="space-y-4">
          {project.paper && (
            <Card className="bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium flex items-center gap-2 text-[#262625] dark:text-[#FAF9F6] mb-2">
                  <FileText className="h-4 w-4 text-[#C96442]" />
                  Paper Details
                </h3>

                <div className="space-y-2 text-xs">
                  <p className="font-medium text-[#262625] dark:text-[#FAF9F6]">
                    {project.paper.title}
                  </p>

                  <div className="flex items-center gap-2 text-[#262625]/70 dark:text-[#BFB8AC]">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDate(new Date(project.paper.publishedDate))}
                    </span>
                  </div>

                  {project.paper.authors &&
                    project.paper.authors.length > 0 && (
                      <div className="flex items-start gap-2 text-[#262625]/70 dark:text-[#BFB8AC]">
                        <User className="h-3 w-3 mt-0.5" />
                        <div className="flex-1">
                          {project.paper.authors.slice(0, 3).join(", ")}
                          {project.paper.authors.length > 3 && " et al."}
                        </div>
                      </div>
                    )}

                  {project.paper.categories &&
                    project.paper.categories.length > 0 && (
                      <div className="flex items-start gap-2 text-[#262625]/70 dark:text-[#BFB8AC]">
                        <Tag className="h-3 w-3 mt-0.5" />
                        <div className="flex-1">
                          {project.paper.categories.slice(0, 2).join(", ")}
                          {project.paper.categories.length > 2 && " ..."}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-[#262625]/50 dark:text-[#BFB8AC]/50">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDate(new Date(project.createdAt))}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Last updated</span>
              <span>{formatDate(new Date(project.updatedAt))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
