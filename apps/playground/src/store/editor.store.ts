import { create } from 'zustand';

type EditorStore = {
  setSource: (source: string) => void;
  source: string;
};

export const useEditorStore = create<EditorStore>((set) => ({
  setSource: (source) => set({ source }),
  source: ''
}));
