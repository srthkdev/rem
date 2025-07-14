
import { create } from 'zustand';

type AnalysisState = {
  activeTab: 'analysis' | 'insights' | 'diagram' | 'chat' | 'flashcards' | 'podcast' | 'visualization';
  activeSummaryLevel: 'eli5' | 'college' | 'expert';
  setActiveTab: (tab: AnalysisState['activeTab']) => void;
  setActiveSummaryLevel: (level: AnalysisState['activeSummaryLevel']) => void;
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  activeTab: 'analysis',
  activeSummaryLevel: 'college',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveSummaryLevel: (level) => set({ activeSummaryLevel: level }),
}));
