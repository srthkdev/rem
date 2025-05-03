import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  sender: z.enum(["user", "ai"]),
  timestamp: z.date(),
  projectId: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

interface ChatStore {
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  getProjectMessages: (projectId: string) => Message[];
  clearProjectMessages: (projectId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: (message) => {
        const newMessage: Message = {
          id: crypto.randomUUID(),
          ...message,
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      getProjectMessages: (projectId) => {
        return get().messages.filter((m) => m.projectId === projectId);
      },
      clearProjectMessages: (projectId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.projectId !== projectId),
        }));
      },
    }),
    {
      name: "chat-storage",
    },
  ),
);
