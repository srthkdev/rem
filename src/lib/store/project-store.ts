import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

// Schema for ArXiv Paper
export const ArxivPaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  summary: z.string(),
  publishedDate: z.string(),
  pdfUrl: z.string(),
  categories: z.array(z.string()),
  doi: z.string().optional(),
});

export type ArxivPaper = z.infer<typeof ArxivPaperSchema>;

// Schema for Project
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  paper: ArxivPaperSchema.optional(),
  lastMessage: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

interface ProjectState {
  projects: Project[];
  searchResults: ArxivPaper[];
  selectedPaper: ArxivPaper | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  setSearchResults: (papers: ArxivPaper[]) => void;
  setSelectedPaper: (paper: ArxivPaper | null) => void;
  clearSearchResults: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      searchResults: [],
      selectedPaper: null,

      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project],
        }));
      },

      updateProject: (id, updatedProject) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updatedProject, updatedAt: new Date() }
              : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      getProject: (id) => {
        return get().projects.find((project) => project.id === id);
      },

      setSearchResults: (papers) => {
        set({ searchResults: papers });
      },

      setSelectedPaper: (paper) => {
        set({ selectedPaper: paper });
      },

      clearSearchResults: () => {
        set({ searchResults: [], selectedPaper: null });
      },
    }),
    {
      name: "rem-projects",
    }
  )
); 