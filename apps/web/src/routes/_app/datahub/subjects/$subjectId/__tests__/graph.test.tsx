import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LineGraphLine } from '@/components/LineGraph';
import { Route } from '@/routes/_app/datahub/subjects/$subjectId/graph';

import '@/services/i18n';

type CloneHandler = (document: Document, element: HTMLElement) => void;

type DownloadFunction = (filename: string, fetchData: () => Blob, options: { blobType: string }) => Promise<void>;

const mocks = vi.hoisted(() => ({
  download: vi.fn<DownloadFunction>(),
  downloadSelection: { current: null as ((option: string) => void) | null },
  html2canvas: vi.fn<(element: HTMLElement, options: { onclone: CloneHandler }) => Promise<HTMLCanvasElement>>(),
  setInstrumentId: vi.fn(),
  setMinDate: vi.fn(),
  useGraphData: vi.fn(),
  useGraphLines: vi.fn(),
  useInstrumentVisualization: vi.fn(),
  useLinearModelQuery: vi.fn(),
  useMeasureOptions: vi.fn()
}));

vi.mock('html2canvas', () => ({ default: mocks.html2canvas }));
vi.mock('@/hooks/useGraphData', () => ({ useGraphData: mocks.useGraphData }));
vi.mock('@/hooks/useGraphLines', () => ({ useGraphLines: mocks.useGraphLines }));
vi.mock('@/hooks/useInstrumentVisualization', () => ({ useInstrumentVisualization: mocks.useInstrumentVisualization }));
vi.mock('@/hooks/useLinearModelQuery', () => ({ useLinearModelQuery: mocks.useLinearModelQuery }));
vi.mock('@/hooks/useMeasureOptions', () => ({ useMeasureOptions: mocks.useMeasureOptions }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentGroup: { id: string } }) => unknown) =>
    selector({ currentGroup: { id: 'group-1' } })
}));
vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useDownload: () => mocks.download
}));
vi.mock('@douglasneuroinformatics/libui/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/components')>()),
  ActionDropdown: ({
    disabled,
    onSelection,
    title
  }: {
    disabled: boolean;
    onSelection: (option: string) => void;
    title: string;
  }) => {
    mocks.downloadSelection.current = onSelection;
    return (
      <button disabled={disabled} type="button" onClick={() => onSelection('png')}>
        {title}
      </button>
    );
  },
  ListboxDropdown: ({
    disabled,
    options,
    setSelected,
    title
  }: {
    disabled: boolean;
    options: ListboxDropdownOption[];
    setSelected: (selected: ListboxDropdownOption[]) => void;
    title: string;
  }) => (
    <button disabled={disabled} type="button" onClick={() => setSelected(options)}>
      {title}
    </button>
  )
}));
vi.mock('@/components/LineGraph', () => ({
  LineGraph: ({ data, lines, xAxis }: { data: unknown; lines: unknown; xAxis: { key: string; label: string } }) => (
    <span
      data-graph-data={JSON.stringify(data)}
      data-key={xAxis.key}
      data-label={xAxis.label}
      data-lines={JSON.stringify(lines)}
      data-testid="line-graph"
    />
  )
}));
vi.mock('@/components/SelectInstrument', () => ({
  SelectInstrument: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <button data-testid="select-instrument" type="button" onClick={() => onSelect('instrument-2')} />
  )
}));
vi.mock('@/components/SelectEdition', () => ({
  SelectEdition: ({ onSelect, value }: { onSelect: (id: string) => void; value: null | string }) => (
    <button data-testid="select-edition" data-value={value} type="button" onClick={() => onSelect('instrument-3')} />
  )
}));
vi.mock('@/components/TimeDropdown', () => ({
  TimeDropdown: ({ disabled, setMinTime }: { disabled: boolean; setMinTime: (value: Date | null) => void }) => (
    <button
      data-testid="select-time"
      disabled={disabled}
      type="button"
      onClick={() => setMinTime(new Date(2026, 0, 1))}
    />
  )
}));

const instrument: AnyUnilingualFormInstrument = { ...unilingualFormInstrument.instance, measures: null };

const measureOptions: ListboxDropdownOption[] = [
  { key: 'score', label: 'Score' },
  { key: 'mood', label: 'Mood' }
];

const models = { score: { intercept: 1, slope: 2, stdErr: 0.5 } };
const records = [{ __date__: new Date(2026, 0, 2), __id__: 'record-1', __time__: 1, score: 3 }];
const graphData = [{ __time__: 1, score: 3 }];
const lines: LineGraphLine[] = [{ name: 'Score', val: 'score' }];
const pngBlob = new Blob(['png'], { type: 'image/png' });

let clonedChart: HTMLElement | null = null;
let encodedBlob: Blob | null = pngBlob;

const renderGraph = ({
  displayedInstrument = instrument,
  instrumentId = 'instrument-1',
  minDate = null
}: {
  displayedInstrument?: AnyUnilingualFormInstrument;
  instrumentId?: null | string;
  minDate?: Date | null;
} = {}) => {
  mocks.useInstrumentVisualization.mockReturnValue({
    editionOptions: {},
    instrument: displayedInstrument,
    instrumentId,
    instrumentOptions: {},
    minDate,
    records,
    setInstrumentId: mocks.setInstrumentId,
    setMinDate: mocks.setMinDate
  });
  const Component = Route.options.component!;
  return render(<Component />);
};

const lastSelectedMeasures = () => mocks.useGraphLines.mock.lastCall?.[0];

const selectAllMeasures = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Measures' }));
};

const downloadGraph = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Download' }));
  await waitFor(() => expect(mocks.download).toHaveBeenCalled());
};

const clonedText = () => Array.from(clonedChart!.querySelectorAll(':scope > p'), (paragraph) => paragraph.textContent);

beforeEach(() => {
  clonedChart = null;
  encodedBlob = pngBlob;
  mocks.html2canvas.mockImplementation((_, { onclone }) => {
    clonedChart = document.createElement('div');
    onclone(document, clonedChart);
    const canvas = document.createElement('canvas');
    canvas.toBlob = (callback) => callback(encodedBlob);
    return Promise.resolve(canvas);
  });
  mocks.useGraphData.mockReturnValue(graphData);
  mocks.useGraphLines.mockReturnValue(lines);
  mocks.useLinearModelQuery.mockReturnValue({ data: models });
  mocks.useMeasureOptions.mockReturnValue(measureOptions);
  vi.spyOn(Route, 'useParams').mockReturnValue({ subjectId: 'abcdefghijkl' });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('subject graph route', () => {
  it('should visualize only the form records of the subject in the url', () => {
    renderGraph();
    expect(mocks.useInstrumentVisualization).toHaveBeenCalledWith({
      params: { kind: 'FORM', subjectId: 'abcdefghijkl' }
    });
  });

  it('should not fetch the group trend before an instrument is selected', () => {
    renderGraph({ instrumentId: null });
    expect(mocks.useLinearModelQuery).toHaveBeenLastCalledWith({
      enabled: false,
      params: { groupId: 'group-1', instrumentId: null }
    });
  });

  it('should fetch the group trend of the selected instrument within the current group', () => {
    renderGraph();
    expect(mocks.useLinearModelQuery).toHaveBeenLastCalledWith({
      enabled: true,
      params: { groupId: 'group-1', instrumentId: 'instrument-1' }
    });
  });

  it.each(['Measures', 'Download'])('should disable the %s control until an instrument is selected', (name) => {
    renderGraph({ instrumentId: null });
    expect(screen.getByRole('button', { name }).hasAttribute('disabled')).toBe(true);
  });

  it('should disable the timeframe control until an instrument is selected', () => {
    renderGraph({ instrumentId: null });
    expect(screen.getByTestId('select-time').hasAttribute('disabled')).toBe(true);
  });

  it('should enable the measure, timeframe and download controls once an instrument is selected', () => {
    renderGraph();
    const controls = [
      screen.getByRole('button', { name: 'Measures' }),
      screen.getByTestId('select-time'),
      screen.getByRole('button', { name: 'Download' })
    ];
    expect(controls.map((control) => control.hasAttribute('disabled'))).toEqual([false, false, false]);
  });

  it('should offer the measures of the selected instrument', () => {
    renderGraph();
    expect(mocks.useMeasureOptions).toHaveBeenCalledWith(instrument);
  });

  it('should graph the selected measures of the records against the group trend', () => {
    renderGraph();
    selectAllMeasures();
    expect(mocks.useGraphData).toHaveBeenLastCalledWith({ models, records, selectedMeasures: measureOptions });
    expect(lastSelectedMeasures()).toEqual({ selectedMeasures: measureOptions });
  });

  it('should plot the graph data and lines against collection time', () => {
    renderGraph();
    const graph = screen.getByTestId('line-graph');
    expect(graph.dataset).toMatchObject({
      graphData: JSON.stringify(graphData),
      key: '__time__',
      label: 'Date Collected',
      lines: JSON.stringify(lines)
    });
  });

  it.each([
    ['instrument', 'select-instrument', 'instrument-2'],
    ['edition', 'select-edition', 'instrument-3']
  ])(
    'should clear the selected measures when another %s is selected, since they belong to the old one',
    (_, testId, id) => {
      renderGraph();
      selectAllMeasures();
      fireEvent.click(screen.getByTestId(testId));
      expect(mocks.setInstrumentId).toHaveBeenCalledWith(id);
      expect(lastSelectedMeasures()).toEqual({ selectedMeasures: [] });
    }
  );

  it('should mark the selected instrument as the current edition', () => {
    renderGraph();
    expect(screen.getByTestId('select-edition').dataset.value).toBe('instrument-1');
  });

  it('should restrict the records to the chosen timeframe', () => {
    renderGraph();
    fireEvent.click(screen.getByTestId('select-time'));
    expect(mocks.setMinDate).toHaveBeenCalledWith(new Date(2026, 0, 1));
  });
});

describe('subject graph download', () => {
  it('should capture the rendered chart', async () => {
    renderGraph();
    await downloadGraph();
    expect(mocks.html2canvas.mock.lastCall?.[0]).toBe(screen.getByTestId('subject-graph-chart'));
  });

  it('should save the capture as a png named after the truncated subject id', async () => {
    renderGraph();
    await downloadGraph();
    const [filename, fetchData, options] = mocks.download.mock.lastCall!;
    expect(filename).toBe('abcdefg.png');
    expect(fetchData()).toBe(pngBlob);
    expect(options).toEqual({ blobType: 'image/png' });
  });

  it('should caption the capture with the instrument, subject, selected measures and an all-time timeframe', async () => {
    renderGraph();
    selectAllMeasures();
    await downloadGraph();
    expect(clonedText()).toEqual([
      'Unilingual Form of Subject: abcdefg',
      'Measures: Score, Mood',
      'Timeframe: All time'
    ]);
  });

  it('should caption the capture with the chosen timeframe up to today', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 4));
    renderGraph({ minDate: new Date(2026, 0, 1) });
    await downloadGraph();
    expect(clonedText()[2]).toBe('Timeframe: 2026-01-01 - 2026-10-04');
  });

  it('should not capture anything once the graph has unmounted', async () => {
    const { unmount } = renderGraph();
    unmount();
    mocks.downloadSelection.current!('png');
    await act(() => Promise.resolve());
    expect(mocks.html2canvas).not.toHaveBeenCalled();
  });

  it('should not save a file when the capture cannot be encoded as a png', async () => {
    encodedBlob = null;
    const vitestListeners = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');
    try {
      const rejection = new Promise((resolve) => process.once('unhandledRejection', resolve));
      renderGraph();
      fireEvent.click(screen.getByRole('button', { name: 'Download' }));
      // The page fires the download without awaiting it, so the failure surfaces as an unhandled rejection.
      await expect(rejection).resolves.toEqual(new Error('blob does not exist'));
    } finally {
      vitestListeners.forEach((listener) => process.on('unhandledRejection', listener));
    }
    expect(mocks.download).not.toHaveBeenCalled();
  });
});
