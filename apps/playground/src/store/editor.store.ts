import { resolveIndexInput } from '@opendatacapture/instrument-bundler';
import type { Simplify } from 'type-fest';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { EditorFile } from '@/models/editor-file.model';

import { useInstrumentStore } from './instrument.store';

type EditorState = {
  files: EditorFile[];
  indexFile: EditorFile | null;
  openFiles: EditorFile[];
  selectedFile: EditorFile | null;
};

type EditorActions = {
  addFile: (file: EditorFile) => void;
  closeFile: (file: EditorFile) => void;
  deleteFile: (file: EditorFile) => void;
  renameFile: (id: string, name: string) => void;
  selectFile: (file: EditorFile) => void;
  setSelectedFileContent: (content: string) => void;
};

type EditorStore = Simplify<EditorActions & EditorState>;

const resolveIndexFile = (files: EditorFile[]) => (files.length ? resolveIndexInput(files) : null);

const { selectedInstrument: defaultSelectedInstrument } = useInstrumentStore.getState();
const defaultIndexFile = resolveIndexInput(defaultSelectedInstrument.files);

const useEditorStore = create(
  subscribeWithSelector<EditorStore>((set) => ({
    addFile: (file) => {
      set(({ files, openFiles }) => {
        const updatedFiles = [...files, file];
        return {
          files: updatedFiles,
          indexFile: resolveIndexFile(updatedFiles),
          openFiles: [...openFiles, file],
          selectedFile: file
        };
      });
    },
    closeFile: (file) => {
      set(({ openFiles }) => {
        const currentIndex = openFiles.indexOf(file);
        const updatedOpenFiles = openFiles.filter((f) => f !== file);
        return {
          openFiles: updatedOpenFiles,
          selectedFile: updatedOpenFiles.at(currentIndex - 1) ?? null
        };
      });
    },
    deleteFile: (file) => {
      set(({ files, openFiles }) => {
        const currentIndex = openFiles.indexOf(file);
        const updatedFiles = files.filter((f) => f !== file);
        const updatedOpenFiles = openFiles.filter((f) => f !== file);
        return {
          files: updatedFiles,
          indexFile: resolveIndexFile(updatedFiles),
          openFiles: updatedOpenFiles,
          selectedFile: updatedOpenFiles.at(currentIndex - 1) ?? null
        };
      });
    },
    files: defaultSelectedInstrument.files,
    indexFile: defaultIndexFile,
    openFiles: [defaultIndexFile],
    renameFile: (id, name) => {
      set(({ files, indexFile, openFiles, selectedFile }) => {
        const updatedFiles = [...files];
        let index = updatedFiles.findIndex((file) => file.id === id);
        if (index === -1) {
          console.error(`Failed to rename file: could not find file with ID '${id}'`);
          return {};
        }
        const updatedFile = { ...files[index], name };
        updatedFiles[index] = updatedFile;

        const updatedOpenFiles = [...openFiles];
        index = updatedOpenFiles.findIndex((file) => file.id === id);
        if (index > -1) {
          updatedOpenFiles[index] = updatedFile;
        }
        return {
          files: updatedFiles,
          indexFile: updatedFile.id === indexFile?.id ? updatedFile : indexFile,
          openFiles: updatedOpenFiles,
          selectedFile: updatedFile.id === selectedFile?.id ? updatedFile : selectedFile
        };
      });
    },
    selectFile: (file) => {
      set(({ openFiles }) => {
        const isOpen = openFiles.includes(file);
        if (!isOpen) {
          return { openFiles: [...openFiles, file], selectedFile: file };
        }
        return { selectedFile: file };
      });
    },
    selectedFile: defaultIndexFile,
    setSelectedFileContent: (content) => {
      set(({ files, selectedFile }) => {
        if (!selectedFile) {
          console.error('Cannot set content: selected file is undefined!');
          return {};
        }
        const updatedFiles = [...files];
        const updatedSelectedFile = { ...selectedFile, content };
        updatedFiles[updatedFiles.indexOf(selectedFile)] = updatedSelectedFile;
        return { files: updatedFiles, selectedFile: updatedSelectedFile };
      });
    }
  }))
);

useInstrumentStore.subscribe(
  (store) => store.selectedInstrument,
  (selectedInstrument, prevSelectedInstrument) => {
    if (selectedInstrument.id === prevSelectedInstrument.id) {
      return;
    }
    const indexFile = resolveIndexFile(selectedInstrument.files);
    useEditorStore.setState({
      files: selectedInstrument.files,
      openFiles: indexFile ? [indexFile] : [],
      selectedFile: indexFile
    });
  }
);

export { useEditorStore };
