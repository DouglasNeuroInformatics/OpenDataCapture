import type { ReactNode } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { SessionType } from '@opendatacapture/schemas/session';
import { cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRecordMetadataColumns } from '../useRecordMetadataColumns';

import type { InstrumentVisualizationRecord } from '../useInstrumentVisualization';

import '@/services/i18n';

const record = (overrides: Partial<InstrumentVisualizationRecord> = {}): InstrumentVisualizationRecord => ({
  __date__: new Date('2025-01-01'),
  __id__: 'record-1',
  __instrumentId__: 'instrument-1',
  __method__: 'IN_PERSON',
  __seriesId__: null,
  __seriesName__: null,
  __subjectId__: 'subject-1',
  __time__: 0,
  ...overrides
});

const columns = (omitSeries = false) => renderHook(() => useRecordMetadataColumns({ omitSeries })).result.current;

/** Renders one column's cell against a record, the way the table would. */
const renderCell = (columnId: string, value: unknown, original: InstrumentVisualizationRecord) => {
  const column = columns().find((candidate) => candidate.id === columnId)!;
  const cell = (column as { cell: (ctx: unknown) => ReactNode }).cell;
  render(<>{cell({ getValue: () => value, row: { original } })}</>);
};

/** Renders one column's header the way the table would, returning its sort toggle. */
const renderHeader = (columnId: string, omitSeries = false) => {
  const column = columns(omitSeries).find((candidate) => candidate.id === columnId)!;
  const header = (column as { header: (ctx: unknown) => ReactNode }).header;
  const toggleSorting = vi.fn();
  render(<>{header({ column: { getIsSorted: () => false, toggleSorting } })}</>);
  return toggleSorting;
};

describe('useRecordMetadataColumns', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should show both provenance columns under the names the export uses', () => {
    expect(columns().map((column) => column.id)).toStrictEqual(['__method__', '__seriesName__']);
    expect(renderHeader('__method__') && screen.getByRole('button').textContent).toBe('COLLECTION_METHOD');
    cleanup();
    expect(renderHeader('__seriesName__') && screen.getByRole('button').textContent).toBe('SERIES');
  });

  // Every row on a series' own page names that same series, so the column says nothing there.
  it('should omit the series column when asked', () => {
    expect(columns(true).map((column) => column.id)).toStrictEqual(['__method__']);
  });

  // These sit mid-table beside sortable columns, so a plain label would read as the odd one out.
  it.each(['__method__', '__seriesName__'])('should let the %s column be sorted from its header', (columnId) => {
    const toggleSorting = renderHeader(columnId);
    fireEvent.click(screen.getByRole('button'));
    expect(toggleSorting).toHaveBeenCalled();
  });

  it('should translate the collection method rather than showing the stored enum', () => {
    renderCell('__method__', 'REMOTE', record({ __method__: 'REMOTE' }));
    expect(screen.getByTestId('record-cell-collection-method').textContent).toBe('Remote');
  });

  // A record whose session was deleted reads back without a type, which must not render as blank
  // or as "null".
  it('should name the absence for a record whose collection method is unknown', () => {
    renderCell('__method__', null, record({ __method__: null }));
    expect(screen.getByTestId('record-cell-collection-method').textContent).toBe('None');
  });

  it('should show the series name when the record was collected under one', () => {
    renderCell('__seriesName__', 'Happiness Series', record({ __seriesName__: 'Happiness Series' }));
    expect(screen.getByTestId('record-cell-series').textContent).toBe('Happiness Series');
  });

  // The presence of a series name is itself the individual-vs-series answer, so the absence has to
  // read as "none" rather than as missing data.
  it('should name the absence for a record collected individually', () => {
    renderCell('__seriesName__', null, record());
    expect(screen.getByTestId('record-cell-series').textContent).toBe('None');
  });

  it('should filter the method column on the stored value, not the translated label', () => {
    const column = columns().find((candidate) => candidate.id === '__method__')!;
    const filterFn = column.filterFn as (row: unknown, id: string, filter: SessionType[]) => boolean;
    const row = { getValue: () => 'IN_PERSON' };
    expect(filterFn(row, '__method__', ['IN_PERSON'])).toBe(true);
    expect(filterFn(row, '__method__', ['REMOTE'])).toBe(false);
  });

  // Filtered on the id rather than the displayed name, since a name is not a stable identity.
  it('should filter the series column on the series id', () => {
    const column = columns().find((candidate) => candidate.id === '__seriesName__')!;
    const filterFn = column.filterFn as (row: unknown, id: string, filter: string[]) => boolean;
    const inSeries = { original: record({ __seriesId__: 'series-1', __seriesName__: 'Happiness Series' }) };
    expect(filterFn(inSeries, '__seriesName__', ['series-1'])).toBe(true);
    expect(filterFn(inSeries, '__seriesName__', ['series-2'])).toBe(false);
  });

  it('should match a record collected outside any series against the no-series option', () => {
    const column = columns().find((candidate) => candidate.id === '__seriesName__')!;
    const filterFn = column.filterFn as (row: unknown, id: string, filter: string[]) => boolean;
    expect(filterFn({ original: record() }, '__seriesName__', [''])).toBe(true);
  });
});
