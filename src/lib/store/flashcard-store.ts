import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

export const flashcardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  heading: z.string().min(1, "Heading is required"),
  information: z.string().min(1, "Information is required"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Flashcard = z.infer<typeof flashcardSchema>;

interface FlashcardStore {
  flashcards: Flashcard[];
  addFlashcard: (
    projectId: string,
    heading: string,
    information: string,
  ) => void;
  deleteFlashcard: (id: string) => void;
  getProjectFlashcards: (projectId: string) => Flashcard[];
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      flashcards: [],
      addFlashcard: (projectId, heading, information) => {
        const newFlashcard: Flashcard = {
          id: crypto.randomUUID(),
          projectId,
          heading,
          information,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          flashcards: [...state.flashcards, newFlashcard],
        }));
      },
      deleteFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter((f) => f.id !== id),
        }));
      },
      getProjectFlashcards: (projectId) => {
        return get().flashcards.filter((f) => f.projectId === projectId);
      },
    }),
    {
      name: "flashcards-storage",
    },
  ),
);
