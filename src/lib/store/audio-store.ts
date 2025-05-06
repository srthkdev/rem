import { create } from "zustand";
import { z } from "zod";

const AudioStateSchema = z.object({
  isPlaying: z.boolean(),
  volume: z.number().min(0).max(1),
  audioUrl: z.string(),
});

type AudioState = z.infer<typeof AudioStateSchema> & {
  currentTime: number;
  duration: number;
  setIsPlaying: (v: boolean) => void;
  setVolume: (v: number) => void;
  setCurrentTime: (v: number) => void;
  setDuration: (v: number) => void;
  setAudioUrl: (v: string) => void;
};

const defaultUrl = "/audio/lofi.mp3";

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  volume: 0.7,
  audioUrl: defaultUrl,
  currentTime: 0,
  duration: 0,
  setIsPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => set({ volume: v }),
  setCurrentTime: (v) => set({ currentTime: v }),
  setDuration: (v) => set({ duration: v }),
  setAudioUrl: (v) => set({ audioUrl: v }),
}));
