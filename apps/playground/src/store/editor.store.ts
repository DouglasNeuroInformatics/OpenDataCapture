import { create } from 'zustand';

import { useInstrumentStore } from './instrument.store';

const defaultValue = useInstrumentStore.getState().defaultInstrument.source;

type EditorStore = {
  setValue: (value: string) => void;
  value: string;
};

export const useEditorStore = create<EditorStore>((set) => ({
  setValue: (value) => set({ value }),
  value: defaultValue
}));
