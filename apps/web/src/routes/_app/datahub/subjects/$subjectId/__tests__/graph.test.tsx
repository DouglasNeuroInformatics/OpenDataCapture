import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LineGraphLine } from '@/components/LineGraph';
import { Route } from '@/routes/_app/datahub/subjects/$subjectId/graph';

import '@/services/i18n';

type DownloadFunction = (filename: string, fetchData: () => Blob, options: { blobType: string }) => Promise<void>;

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn<(notification: { message: string; type: string }) => void>(),
  download: vi.fn<DownloadFunction>(),
  downloadSelection: { current: null as ((option: string) => void) | null },
  navigate: vi.fn(),
  setInstrumentId: vi.fn(),
  setMinDate: vi.fn(),
  useGraphData: vi.fn(),
  useGraphLines: vi.fn(),
  useInstrumentVisualization: vi.fn(),
  useLinearModelQuery: vi.fn(),
  useMeasureOptions: vi.fn()
}));

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
  useDownload: () => mocks.download,
  useNotificationsStore: (selector: (store: { addNotification: typeof mocks.addNotification }) => unknown) =>
    selector({ addNotification: mocks.addNotification })
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
    <svg
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
vi.mock('@/components/SelectChartPalette', () => ({
  SelectChartPalette: ({ onSelect, slots, value }: { onSelect: (p: string) => void; slots: number; value: string }) => (
    <button
      data-slots={slots}
      data-testid="select-palette"
      data-value={value}
      type="button"
      onClick={() => onSelect('jade')}
    />
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

let encodedBlob: Blob | null = pngBlob;

/**
 * The capture draws onto a canvas, which happy-dom has no 2D context for — so the context is
 * recorded instead, letting a test assert what the image would say.
 */
let drawnText: string[] = [];
let drawnImages = 0;

const fakeContext = {
  arc: () => undefined,
  beginPath: () => undefined,
  drawImage: () => {
    drawnImages += 1;
  },
  fill: () => undefined,
  fillRect: () => undefined,
  fillStyle: '',
  fillText: (text: string) => {
    drawnText.push(text);
  },
  font: '',
  measureText: (text: string) => ({ width: text.length * 6 }),
  scale: () => undefined,
  textAlign: ''
};

/** A detached image never loads a data URL under happy-dom, so the decode is resolved here. */
class FakeImage {
  private onLoad: (() => void) | null = null;

  set src(_value: string) {
    queueMicrotask(() => this.onLoad?.());
  }

  addEventListener(type: string, listener: () => void) {
    if (type === 'load') {
      this.onLoad = listener;
    }
  }
}

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

beforeEach(() => {
  encodedBlob = pngBlob;
  drawnText = [];
  drawnImages = 0;
  vi.stubGlobal('Image', FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    fakeContext as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(encodedBlob));
  mocks.useGraphData.mockReturnValue(graphData);
  mocks.useGraphLines.mockReturnValue(lines);
  mocks.useLinearModelQuery.mockReturnValue({ data: models });
  mocks.useMeasureOptions.mockReturnValue(measureOptions);
  vi.spyOn(Route, 'useParams').mockReturnValue({ subjectId: 'abcdefghijkl' });
  vi.spyOn(Route, 'useSearch').mockReturnValue({ palette: 'default' });
  vi.spyOn(Route, 'useNavigate').mockReturnValue(mocks.navigate);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('subject graph route', () => {
  // Every kind the subject holds records for, not forms alone: an interactive instrument's measures
  // plot the same way, and filtering to forms left them unreachable from the dropdown.
  it('should visualize the records of the subject in the url whatever kind collected them', () => {
    renderGraph();
    expect(mocks.useInstrumentVisualization).toHaveBeenCalledWith({
      params: { subjectId: 'abcdefghijkl' }
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
    expect(lastSelectedMeasures()).toEqual({ palette: 'default', selectedMeasures: measureOptions });
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
      expect(lastSelectedMeasures()).toEqual({ palette: 'default', selectedMeasures: [] });
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
  // The chart's own SVG is rasterized, rather than the page being screenshotted around it.
  it('should draw the rendered chart into the capture', async () => {
    renderGraph();
    await downloadGraph();
    expect(drawnImages).toBe(1);
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
    expect(drawnText).toEqual([
      'Unilingual Form of Subject: abcdefg',
      'Score',
      'Measures: Score, Mood',
      'Timeframe: All time'
    ]);
  });

  it('should caption the capture with the chosen timeframe up to today', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 4));
    renderGraph({ minDate: new Date(2026, 0, 1) });
    await downloadGraph();
    expect(drawnText.at(-1)).toBe('Timeframe: 2026-01-01 - 2026-10-04');
  });

  // An empty selection has nothing to name, and the line read as "Measures: " with a dangling colon.
  it('should leave out the measures caption when none is selected', async () => {
    renderGraph();
    await downloadGraph();
    expect(drawnText).toEqual(['Unilingual Form of Subject: abcdefg', 'Score', 'Timeframe: All time']);
  });

  it('should not capture anything once the graph has unmounted', async () => {
    const { unmount } = renderGraph();
    unmount();
    mocks.downloadSelection.current!('png');
    await act(() => Promise.resolve());
    expect(drawnImages).toBe(0);
    expect(mocks.download).not.toHaveBeenCalled();
  });

  // A download that quietly does nothing is indistinguishable from a broken button, so the failure
  // is reported rather than left to escape as an unhandled rejection.
  it('should report the failure and save nothing when the capture cannot be encoded as a png', async () => {
    encodedBlob = null;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderGraph();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    await waitFor(() => expect(mocks.addNotification).toHaveBeenCalled());
    // The cause is named in the message, so a failure is diagnosable rather than merely reported.
    expect(mocks.addNotification).toHaveBeenCalledWith({
      message: 'The chart could not be saved as an image: The chart could not be encoded as an image',
      type: 'error'
    });
    expect(mocks.download).not.toHaveBeenCalled();
  });
});
