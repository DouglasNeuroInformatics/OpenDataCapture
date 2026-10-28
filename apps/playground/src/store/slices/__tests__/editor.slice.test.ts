import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/store';

import { createEditorSlice } from '../editor.slice';

vi.mock('idb-keyval', () => ({ del: vi.fn(), get: vi.fn(), set: vi.fn() }));

vi.mock('@/instruments', () => {
  const defaultSelectedInstrument = {
    category: 'Templates',
    files: [{ content: 'export default {};', name: 'index.ts' }],
    id: 'default',
    kind: 'FORM',
    label: 'Unilingual Form'
  };
  return { defaultInstruments: [defaultSelectedInstrument], defaultSelectedInstrument };
});

const { closeFile, deleteFile } = createEditorSlice(useAppStore.setState, useAppStore.getState, useAppStore);

describe('createEditorSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      files: [
        { content: '', name: 'index.ts' },
        { content: '', name: 'a.ts' },
        { content: '', name: 'b.ts' }
      ],
      openFilenames: ['index.ts', 'a.ts', 'b.ts'],
      selectedFilename: 'b.ts'
    });
  });

  it('should keep the active file selected when a background tab is closed', () => {
    closeFile('a.ts');
    expect(useAppStore.getState().openFilenames).toEqual(['index.ts', 'b.ts']);
    expect(useAppStore.getState().selectedFilename).toBe('b.ts');
  });

  it('should keep the active file selected when a file open in a background tab is deleted', () => {
    deleteFile('a.ts');
    expect(useAppStore.getState().openFilenames).toEqual(['index.ts', 'b.ts']);
    expect(useAppStore.getState().selectedFilename).toBe('b.ts');
  });

  it('should select the tab to the left when the active tab is closed', () => {
    closeFile('b.ts');
    expect(useAppStore.getState().selectedFilename).toBe('a.ts');
  });

  it('should select the tab to the left when the active file is deleted', () => {
    deleteFile('b.ts');
    expect(useAppStore.getState().files.map(({ name }) => name)).toEqual(['index.ts', 'a.ts']);
    expect(useAppStore.getState().selectedFilename).toBe('a.ts');
  });
});
