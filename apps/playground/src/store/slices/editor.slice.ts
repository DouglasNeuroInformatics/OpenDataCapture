import { merge } from 'lodash-es';

import { resolveIndexFilename } from '@/utils/file';

import type { EditorSlice, SliceCreator } from '../types';

export const createEditorSlice: SliceCreator<EditorSlice> = (set, get) => ({
  addFile: (file) => {
    set((state) => {
      const isExisting = state.files.map((file) => file.name).includes(file.name);
      if (isExisting) {
        console.error(`Cannot add file with existing name '${file.name}'`);
        return;
      }
      state.files.push(file);
      state.indexFilename = resolveIndexFilename(state.files);
      state.openFilenames.push(file.name);
      state.selectedFilename = file.name;
    });
  },
  addFiles(files) {
    set((state) => {
      for (const file of files) {
        const isExisting = state.files.map((file) => file.name).includes(file.name);
        if (isExisting) {
          console.error(`Cannot add file with existing name '${file.name}'`);
          return;
        }
      }
      state.files = state.files.concat(files);
      state.indexFilename = resolveIndexFilename(state.files);
    });
  },
  closeFile: (name) => {
    set((state) => {
      const currentIndex = state.openFilenames.indexOf(name);
      if (currentIndex > -1) {
        state.openFilenames.splice(currentIndex, 1);
        state.selectedFilename = state.openFilenames.at(currentIndex - 1) ?? null;
      }
    });
  },
  deleteFile: (name) => {
    set((state) => {
      state.files = state.files.filter((file) => file.name !== name);
      const currentIndex = state.openFilenames.indexOf(name);
      if (currentIndex > -1) {
        state.openFilenames.splice(currentIndex, 1);
        state.selectedFilename = state.openFilenames.at(currentIndex - 1) ?? null;
      }
    });
  },
  files: [],
  indexFilename: null,
  openFilenames: [],
  renameFile: (currentName, updatedName) => {
    get().updateFile(currentName, { name: updatedName });
  },
  selectFile: (name) => {
    set((state) => {
      const file = state.files.find((file) => file.name === name);
      const isOpen = state.openFilenames.includes(name);
      if (!file) {
        console.error(`Cannot select file '${name}': file does not exist`);
        return;
      } else if (!isOpen) {
        state.openFilenames.push(file.name);
      }
      state.selectedFilename = file.name;
    });
  },
  selectedFilename: null,
  setSelectedFileContent: (content) => {
    const { selectedFilename, updateFile } = get();
    if (!selectedFilename) {
      console.error('Cannot set content: selected filename is undefined!');
      return;
    }
    updateFile(selectedFilename, { content });
  },
  updateFile: (name, update) => {
    set((state) => {
      let index = state.files.findIndex((file) => file.name === name);
      if (index === -1) {
        console.error(`Cannot update file '${name}': file does not exist`);
        return;
      } else if (update.name && state.files.find((file) => file.name === update.name)) {
        console.error(`Cannot change filename '${name}' to ${update.name}: file already exists`);
        return;
      }
      const file = state.files[index];
      merge(file, update);
    });
  }
});
