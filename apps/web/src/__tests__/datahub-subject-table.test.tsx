import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/datahub/subjects/$subjectId/table/index';

import '@/services/i18n';

type VisualizationRecord = {
  [key: string]: unknown;
  __date__: unknown;
  __id__: string;
  __time__: number;
};

const mocks = vi.hoisted(() => ({
  visualization: {
    dl: vi.fn(),
    editionOptions: {},
    instrumentId: null as null | string,
    instrumentOptions: {},
    records: [] as VisualizationRecord[],
    setInstrumentId: vi.fn(),
    setMinDate: vi.fn()
  }
}));

vi.mock('@/hooks/useInstrumentVisualization', () => ({
  useInstrumentVisualization: () => mocks.visualization
}));

const navigate = vi.fn();

const record = (overrides: Partial<VisualizationRecord> = {}): VisualizationRecord => ({
  __date__: new Date('2026-01-15'),
  __id__: 'record-1',
  __time__: 0,
  totalScore: 7,
  ...overrides
});

const renderTable = (records: VisualizationRecord[], instrumentId: null | string = 'instrument-1') => {
  mocks.visualization.records = records;
  mocks.visualization.instrumentId = instrumentId;
  const Component = Route.options.component!;
  render(<Component />);
};

const headers = () =>
  Array.from(screen.getByTestId('data-table-head').firstElementChild!.children, (header) => header.textContent).filter(
    Boolean
  );

beforeEach(() => {
  navigate.mockReset();
  mocks.visualization.dl.mockReset();
  vi.spyOn(Route, 'useNavigate').mockReturnValue(navigate);
  vi.spyOn(Route, 'useParams').mockReturnValue({ subjectId: 'subject-1' });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('subject table route', () => {
  it('should add a snake-cased column for each record field, so the headers match the exported column names', () => {
    renderTable([record()]);
    expect(headers()).toEqual(['DATE_COLLECTED', 'COLLECTION_METHOD', 'SERIES', 'TOTAL_SCORE']);
  });

  // The provenance columns describe where a record came from rather than what it measured, so they
  // are fixed rather than derived from the records — they stand even with nothing to describe.
  it('should show the date and provenance columns when there are no records', () => {
    renderTable([]);
    expect(headers()).toEqual(['DATE_COLLECTED', 'COLLECTION_METHOD', 'SERIES']);
  });

  it('should render a multiple-choice answer as comma-separated text', () => {
    renderTable([record({ totalScore: new Set(['a', 'b']) })]);
    expect(screen.getByTestId('subject-table-cell-totalScore').textContent).toBe('a, b');
  });

  it('should format the collection date as an ISO date', () => {
    renderTable([record()]);
    expect(screen.getByText('2026-01-15')).toBeTruthy();
  });

  it('should show a collection date that is not a Date unchanged', () => {
    renderTable([record({ __date__: 'unknown date' })]);
    expect(screen.getByText('unknown date')).toBeTruthy();
  });

  it('should open the record when its row is double-clicked', () => {
    renderTable([record()]);
    fireEvent.doubleClick(screen.getByTestId('data-table-row'));
    expect(navigate).toHaveBeenCalledWith({ params: { recordId: 'record-1' }, to: './$recordId' });
  });

  it('should open the record from the view row action', () => {
    renderTable([record()]);
    fireEvent.keyDown(screen.getByTestId('row-actions-trigger'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'View' }));
    expect(navigate).toHaveBeenCalledWith({ params: { recordId: 'record-1' }, to: './$recordId' });
  });

  it('should disable the download and timeframe controls until an instrument is selected', () => {
    renderTable([], null);
    expect(screen.getByRole('button', { name: 'Download' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('time-dropdown-trigger').hasAttribute('disabled')).toBe(true);
  });

  it('should download in the chosen format once an instrument is selected', () => {
    renderTable([record()]);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Download' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'CSV Long' }));
    expect(mocks.visualization.dl).toHaveBeenCalledWith('CSV Long');
  });
});
