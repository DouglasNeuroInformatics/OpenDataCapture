import { DataTable } from '@douglasneuroinformatics/libui/components';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SearchSubmitGuard } from '@/components/SearchSubmitGuard';

// Initialises the shared libui translator, which the table's controls read on render.
import '@/services/i18n';

const noop = () => undefined;

const renderTable = (guarded: boolean) => {
  const table = <DataTable columns={[{ accessorKey: 'id', header: 'ID' }]} data={[{ id: 'subject-1' }]} />;
  render(guarded ? <SearchSubmitGuard>{table}</SearchSubmitGuard> : table);
  return screen.getByTestId('data-table-search-bar');
};

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
});

describe('SearchSubmitGuard', () => {
  beforeAll(() => {
    // libui measures the table container; happy-dom has no layout engine.
    globalThis.ResizeObserver ??= class {
      disconnect = noop;
      observe = noop;
      unobserve = noop;
    } as never;
  });

  // `fireEvent` returns false once a handler has called `preventDefault`.
  it('should cancel the search bar submit, so Enter does not reload the page and sign the user out', () => {
    expect(fireEvent.submit(renderTable(true))).toBe(false);
  });

  // Pins the libui behaviour the guard exists for; once this fails, the guard can be removed.
  it('should be needed because libui leaves the search bar submit uncancelled', () => {
    expect(fireEvent.submit(renderTable(false))).toBe(true);
  });
});
