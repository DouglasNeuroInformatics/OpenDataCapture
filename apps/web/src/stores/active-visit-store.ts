import type { Visit } from '@open-data-capture/common/visit';
import { create } from 'zustand';

export type ActiveVisitStore = {
  activeVisit: Visit | null;
  setActiveVisit: (activeVisit: Visit | null) => void;
};

export const useActiveVisitStore = create<ActiveVisitStore>((set) => ({
  activeVisit: null,
  setActiveVisit: (activeVisit) => {
    set({ activeVisit });
  }
}));
