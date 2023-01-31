import { SubjectInterface } from 'common';
import { create } from 'zustand';

export type ActiveSubject = Required<
  Pick<SubjectInterface['demographics'], 'firstName' | 'lastName' | 'dateOfBirth' | 'sex'>
>;

export interface ActiveSubjectStore {
  activeSubject: ActiveSubject | null;
  setActiveSubject: (activeSubject: ActiveSubject | null) => void;
}

export const useActiveSubjectStore = create<ActiveSubjectStore>((set) => ({
  activeSubject: null,
  setActiveSubject: (activeSubject) => set({ activeSubject })
}));
