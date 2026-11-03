// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InstrumentRepository } from '@/models/instrument-repository.model';

import { InstrumentSelector } from '../InstrumentSelector';

const store = vi.hoisted(() => {
  const instruments: InstrumentRepository[] = [
    {
      category: 'Examples',
      files: [],
      id: '0b5d1c2e-7f3a-4c1d-9e8f-2a6b7c8d9e0f',
      kind: 'FORM',
      label: 'Form Reference'
    },
    {
      category: 'Templates',
      files: [],
      id: 'c3e9a1b2-5d6f-4e7a-8b9c-0d1e2f3a4b5c',
      kind: 'FORM',
      label: 'Unilingual Form'
    }
  ];
  return {
    state: {
      instruments,
      selectedInstrument: instruments[1]!,
      setSelectedInstrument: (_id: string) => undefined
    }
  };
});

vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(selector: (state: typeof store.state) => TSelected) => selector(store.state)
}));

function openAndSearch(query: string) {
  fireEvent.click(screen.getByRole('combobox', { name: 'Load an instrument...' }));
  fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: query } });
}

describe('InstrumentSelector', () => {
  beforeEach(() => {
    store.state.setSelectedInstrument = vi.fn();
    render(<InstrumentSelector />);
  });

  afterEach(() => {
    cleanup();
  });

  it('should list an instrument whose label matches the search', () => {
    openAndSearch('Form Reference');
    expect(screen.getByRole('option', { name: 'Form Reference' })).toBeDefined();
    expect(screen.queryByRole('option', { name: 'Unilingual Form' })).toBeNull();
  });

  it('should list nothing for a query only an id matches, so the hidden UUIDs are never searched', () => {
    openAndSearch('4');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No Instruments Found')).toBeDefined();
  });

  it('should select the chosen instrument by its id, though its label is what is searched', () => {
    openAndSearch('Form Reference');
    fireEvent.click(screen.getByRole('option', { name: 'Form Reference' }));
    expect(store.state.setSelectedInstrument).toHaveBeenCalledExactlyOnceWith('0b5d1c2e-7f3a-4c1d-9e8f-2a6b7c8d9e0f');
  });
});
