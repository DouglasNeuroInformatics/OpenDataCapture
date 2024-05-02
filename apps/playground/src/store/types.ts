import type { Simplify } from 'type-fest';
import type { StateCreator } from 'zustand';

import type { EditorFile } from '@/models/editor-file.model';
import type { InstrumentRepository } from '@/models/instrument-repository.model';
import type { Settings } from '@/models/settings.model';

export type EditorState = {
  files: EditorFile[];
  indexFilename: null | string;
  openFilenames: string[];
  selectedFilename: null | string;
};

export type EditorActions = {
  addFile: (file: EditorFile) => void;
  addFiles: (files: EditorFile[]) => void;
  closeFile: (name: string) => void;
  deleteFile: (name: string) => void;
  renameFile: (currentName: string, updatedName: string) => void;
  selectFile: (name: string) => void;
  setSelectedFileContent: (content: string) => void;
  updateFile: (name: string, update: Partial<EditorFile>) => void;
};

export type EditorSlice = Simplify<EditorActions & EditorState>;

export type InstrumentSlice = {
  addInstrument: (item: InstrumentRepository) => void;
  instruments: InstrumentRepository[];
  removeInstrument: (id: string) => void;
  resetInstruments: () => void;
  selectedInstrument: InstrumentRepository;
  setSelectedInstrument: (id: string) => void;
  updateSelectedInstrument: (update: Pick<InstrumentRepository, 'files'>) => void;
};

export type SettingsSlice = {
  resetSettings: () => void;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
};

export type ViewerSlice = {
  viewer: {
    forceRefresh: () => void;
    key: number;
  };
};

export type AppStore = EditorSlice & InstrumentSlice & SettingsSlice & ViewerSlice;

export type SliceCreator<T extends { [key: string]: unknown }> = StateCreator<
  AppStore,
  [['zustand/immer', never], never],
  [['zustand/immer', never]],
  T
>;
