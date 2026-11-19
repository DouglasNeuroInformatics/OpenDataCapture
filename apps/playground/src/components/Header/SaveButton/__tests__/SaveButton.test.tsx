// @vitest-environment happy-dom

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EditorFile } from '@/models/editor-file.model';
import type { InstrumentRepository } from '@/models/instrument-repository.model';

import { SaveButton } from '../SaveButton';

const savedFiles: EditorFile[] = [{ content: 'export default {};', name: 'index.ts' }];

const store = vi.hoisted(() => ({
  editorFiles: { current: [] as EditorFile[] },
  state: {
    selectedInstrument: null as null | Pick<InstrumentRepository, 'category' | 'files'>,
    updateSelectedInstrument: () => undefined
  }
}));

vi.mock('@/hooks/useFilesRef', () => ({ useFilesRef: () => store.editorFiles }));

vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(selector: (state: typeof store.state) => TSelected) => selector(store.state)
}));

const tick = () => {
  act(() => {
    vi.advanceTimersByTime(1000);
  });
};

describe('SaveButton', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  beforeEach(() => {
    vi.useFakeTimers();
    store.editorFiles.current = [{ content: 'export default { edited: true };', name: 'index.ts' }];
    store.state.selectedInstrument = { category: 'Saved', files: savedFiles };
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should disable Save once an edited saved instrument gives way to an example, so edits are never written into one', () => {
    const { rerender } = render(<SaveButton />);
    tick();
    expect(screen.getByRole<HTMLButtonElement>('button').disabled).toBe(false);

    store.state.selectedInstrument = { category: 'Examples', files: savedFiles };
    rerender(<SaveButton />);
    tick();
    expect(screen.getByRole<HTMLButtonElement>('button').disabled).toBe(true);
  });
});
