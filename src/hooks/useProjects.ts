import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  paper: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  paper: z.any().optional(),
  arxivId: z.string().optional(),
  abstract: z.string().optional(),
  authors: z.array(z.string()).optional(),
  pdfUrl: z.string().url().optional(),
  publishedDate: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      return z.array(ProjectSchema).parse(data);
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      CreateProjectSchema.parse(input);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
