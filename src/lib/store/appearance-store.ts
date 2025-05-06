import { create } from "zustand";

interface AppearanceState {
  nekoEnabled: boolean;
  setNekoEnabled: (enabled: boolean) => void;
}

export const useAppearanceStore = create<AppearanceState>((set) => ({
  nekoEnabled: false,
  setNekoEnabled: (enabled) => set({ nekoEnabled: enabled }),
}));
