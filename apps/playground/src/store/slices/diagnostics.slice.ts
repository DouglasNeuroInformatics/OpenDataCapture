import type { DiagnosticsSlice, SliceCreator } from '../types';

export const createDiagnosticsSlice: SliceCreator<DiagnosticsSlice> = (set) => ({
  editorErrors: [],
  setEditorErrors: (editorErrors) => {
    set((state) => {
      state.editorErrors = editorErrors;
    });
  }
});
