import { create } from 'zustand';

export interface ActiveSubject {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
}

export interface ActiveSubjectStore {
  activeSubject: ActiveSubject | null;
  setActiveSubject: (activeSubject: ActiveSubject | null) => void;
}

export const useActiveSubjectStore = create<ActiveSubjectStore>((set) => ({
  activeSubject: null,
  setActiveSubject: (activeSubject) => set({ activeSubject })
}));
