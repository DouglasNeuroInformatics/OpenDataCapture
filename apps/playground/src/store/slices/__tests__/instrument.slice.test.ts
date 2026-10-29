import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InstrumentRepository } from '@/models/instrument-repository.model';
import { useAppStore } from '@/store';

import { createInstrumentSlice } from '../instrument.slice';

vi.mock('idb-keyval', () => ({ del: vi.fn(), get: vi.fn(), set: vi.fn() }));

vi.mock('@/instruments', () => {
  const defaultSelectedInstrument = {
    category: 'Templates',
    files: [{ content: 'export default "template";', name: 'index.ts' }],
    id: 'default',
    kind: 'FORM',
    label: 'Unilingual Form'
  };
  return { defaultInstruments: [defaultSelectedInstrument], defaultSelectedInstrument };
});

const mine: InstrumentRepository = {
  category: 'Saved',
  files: [{ content: 'export default "mine";', name: 'index.ts' }],
  id: 'mine',
  kind: null,
  label: 'Mine'
};

const other: InstrumentRepository = {
  category: 'Saved',
  files: [{ content: 'export default "other";', name: 'index.ts' }],
  id: 'other',
  kind: null,
  label: 'Other'
};

const { addInstrument, removeInstrument, resetInstruments, setSelectedInstrument } = createInstrumentSlice(
  useAppStore.setState.bind(useAppStore),
  useAppStore.getState,
  useAppStore
);

describe('createInstrumentSlice', () => {
  beforeEach(() => {
    resetInstruments();
    addInstrument(structuredClone(mine));
    addInstrument(structuredClone(other));
    setSelectedInstrument(mine.id);
  });

  it("should load the default instrument's files when the selected instrument is removed, so the editor never shows a deleted instrument", () => {
    removeInstrument(mine.id);
    const state = useAppStore.getState();
    expect(state.selectedInstrument.id).toBe('default');
    expect(state.files).toEqual([{ content: 'export default "template";', name: 'index.ts' }]);
    expect(state.indexFilename).toBe('index.ts');
    expect(state.openFilenames).toEqual(['index.ts']);
    expect(state.selectedFilename).toBe('index.ts');
  });

  it('should leave the selection and editor unchanged when a different instrument is removed', () => {
    removeInstrument(other.id);
    const state = useAppStore.getState();
    expect(state.instruments.map(({ id }) => id)).toEqual(['default', 'mine']);
    expect(state.selectedInstrument.id).toBe(mine.id);
    expect(state.files).toEqual(mine.files);
  });
});
