import { create } from "zustand";
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

interface ProjectUIState {
  searchResults: ArxivPaper[];
  selectedPaper: ArxivPaper | null;
  setSearchResults: (papers: ArxivPaper[]) => void;
  setSelectedPaper: (paper: ArxivPaper | null) => void;
  clearSearchResults: () => void;
}

export const useProjectUIStore = create<ProjectUIState>((set) => ({
  searchResults: [],
  selectedPaper: null,
  setSearchResults: (papers) => set({ searchResults: papers }),
  setSelectedPaper: (paper) => set({ selectedPaper: paper }),
  clearSearchResults: () => set({ searchResults: [], selectedPaper: null }),
}));
