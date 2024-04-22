import { isEqual } from 'lodash-es';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { EditorFile } from '@/models/editor-file.model';
import { resolveIndexFile } from '@/utils/resolve';

import { useInstrumentStore } from './instrument.store';

type EditorStore = {
  closeFile: (file: EditorFile) => void;
  files: EditorFile[];
  isModified: boolean;
  openFiles: EditorFile[];
  selectFile: (file: EditorFile) => void;
  selectedFile: EditorFile | null;
  setSelectedFileValue: (value: string) => void;
};

const useEditorStore = create(
  subscribeWithSelector<EditorStore>((set) => ({
    closeFile: (file) => {
      set(({ openFiles }) => {
        const currentIndex = openFiles.indexOf(file);
        const updatedFiles = openFiles.filter((f) => f !== file);
        return { openFiles: updatedFiles, selectedFile: updatedFiles.at(currentIndex - 1) ?? null };
      });
    },
    files: [],
    isModified: false,
    openFiles: [],
    selectFile: (file) => {
      set(({ openFiles }) => {
        const isOpen = openFiles.includes(file);
        if (!isOpen) {
          return { openFiles: [...openFiles, file], selectedFile: file };
        }
        return { selectedFile: file };
      });
    },
    selectedFile: null,
    setSelectedFileValue: (value) => {
      set(({ files, selectedFile }) => {
        if (!selectedFile) {
          console.error('Cannot set value: selected file is undefined!');
          return {};
        }
        const updatedFiles = [...files];
        const updatedSelectedFile = { ...selectedFile, value };
        updatedFiles[updatedFiles.indexOf(selectedFile)] = updatedSelectedFile;
        return { files: updatedFiles, selectedFile: updatedSelectedFile };
      });
    }
  }))
);

// naive solution, consider optimizing for performance if becomes an issue
useEditorStore.subscribe(
  (store) => store.files,
  (files) => {
    const isModified = !isEqual(files, useInstrumentStore.getState().selectedInstrument.files);
    useEditorStore.setState({ isModified });
  }
);

useInstrumentStore.subscribe(
  (store) => store.selectedInstrument,
  (selectedInstrument) => {
    const indexFile = resolveIndexFile(selectedInstrument.files);
    useEditorStore.setState({
      files: selectedInstrument.files,
      openFiles: indexFile ? [indexFile] : [],
      selectedFile: indexFile
    });
  },
  {
    fireImmediately: true
  }
);

export { useEditorStore };
