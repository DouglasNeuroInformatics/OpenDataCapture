import React from 'react';

import { DataTable } from '@douglasneuroinformatics/libui/components';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// Initialises the shared libui translator, which the table's controls read on render.
import '@/services/i18n';

const noop = () => undefined;

type Row = { id: string };

const columns = [{ accessorKey: 'id', header: 'ID' }];

/**
 * Exercises the contract the audit logs route depends on: in server mode the table renders exactly
 * the rows it is given, derives its controls from `pageCount`, and reports page changes back rather
 * than slicing the data itself.
 */
const renderServerTable = (props: {
  data: Row[];
  onPaginationChange: (state: { pageIndex: number; pageSize: number }) => void;
  pageCount: number;
}) => render(<DataTable<Row> columns={columns} mode="server" {...props} />);

describe('DataTable in server mode', () => {
  beforeAll(() => {
    // libui measures the table container; happy-dom has no layout engine.
    globalThis.ResizeObserver ??= class {
      disconnect = noop;
      observe = noop;
      unobserve = noop;
    } as never;
  });

  it('should render every row it is handed, without paginating them itself', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: `log-${i}` }));
    renderServerTable({ data, onPaginationChange: vi.fn(), pageCount: 500 });
    for (const row of data) {
      expect(screen.getByText(row.id)).toBeTruthy();
    }
  });

  it('should report the new page index when the user pages forward', () => {
    const onPaginationChange = vi.fn();
    renderServerTable({ data: [{ id: 'log-0' }], onPaginationChange, pageCount: 5 });
    const pageTwo = screen.getAllByRole('button', { hidden: true }).filter((el) => el.textContent === '2');
    expect(pageTwo.length).toBeGreaterThan(0);
    pageTwo.forEach((button) => fireEvent.click(button));
    expect(onPaginationChange).toHaveBeenCalledWith(expect.objectContaining({ pageIndex: 1 }));
  });

  it('should build its page controls from pageCount rather than from the rows it holds', () => {
    // A single row, but the server reports three pages: the controls must come from `pageCount`.
    renderServerTable({ data: [{ id: 'log-0' }], onPaginationChange: vi.fn(), pageCount: 3 });
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('4')).toHaveLength(0);
  });
});
