import type { SubjectIdentificationData } from '@open-data-capture/types';
import { create } from 'zustand';

export type ActiveVisit = {
  subject: SubjectIdentificationData;
};

export type ActiveVisitStore = {
  activeVisit: ActiveVisit | null;
  setActiveVisit: (activeVisit: ActiveVisit | null) => void;
};

export const useActiveVisitStore = create<ActiveVisitStore>((set) => ({
  activeVisit: null,
  setActiveVisit: (activeVisit) => {
    set({ activeVisit });
  }
}));
