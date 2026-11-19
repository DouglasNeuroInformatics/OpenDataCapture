// @vitest-environment happy-dom

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteInstrumentDialog } from '../DeleteInstrumentDialog';

const store = vi.hoisted(() => ({
  state: {
    removeInstrument: (_id: string) => undefined,
    selectedInstrument: { id: 'mine' }
  }
}));

vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(selector: (state: typeof store.state) => TSelected) => selector(store.state)
}));

describe('DeleteInstrumentDialog', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  beforeEach(() => {
    store.state.removeInstrument = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('should remove the selected instrument once deletion is confirmed, which makes the store load the default template', () => {
    const setIsOpen = vi.fn();
    render(<DeleteInstrumentDialog isOpen setIsOpen={setIsOpen} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(store.state.removeInstrument).toHaveBeenCalledExactlyOnceWith('mine');
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
