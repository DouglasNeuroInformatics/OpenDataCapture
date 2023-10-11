import { create } from 'zustand';

export type ActiveSubject = {
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  sex: 'female' | 'male';
};

export type ActiveSubjectStore = {
  activeSubject: ActiveSubject | null;
  setActiveSubject: (activeSubject: ActiveSubject | null) => void;
};

export const useActiveSubjectStore = create<ActiveSubjectStore>((set) => ({
  activeSubject: null,
  setActiveSubject: (activeSubject) => {
    set({ activeSubject });
  }
}));
