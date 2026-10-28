import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RecordChartSeries } from '@/hooks/useRecordChartSeries';
import { Route } from '@/routes/_app/datahub/instruments/$instrumentId/graph';

import '@/services/i18n';

type Search = {
  chart: 'distribution' | 'scatter';
  colourBy: 'method' | 'none' | 'series';
  measure?: string;
  minDateKey: 'all' | 'pastMonth' | 'pastYear';
  palette: 'berry' | 'default' | 'ember' | 'jade';
};

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn<(notification: { message: string; type: string }) => void>(),
  chartImageFilename: vi.fn((stem: string) => `${stem}.png`),
  download: vi.fn(),
  downloadSelection: { current: null as ((option: string) => void) | null },
  navigate: vi.fn(),
  renderChartPng: vi.fn(),
  useInstrumentHubRecords: vi.fn(),
  useLinearModelQuery: vi.fn(),
  useMeasureOptions: vi.fn(),
  useRecordChartSeries: vi.fn()
}));

vi.mock('@/hooks/useInstrumentHubRecords', () => ({ useInstrumentHubRecords: mocks.useInstrumentHubRecords }));
vi.mock('@/hooks/useLinearModelQuery', () => ({ useLinearModelQuery: mocks.useLinearModelQuery }));
vi.mock('@/hooks/useMeasureOptions', () => ({ useMeasureOptions: mocks.useMeasureOptions }));
vi.mock('@/hooks/useRecordChartSeries', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useRecordChartSeries')>()),
  useRecordChartSeries: mocks.useRecordChartSeries
}));
vi.mock('@/utils/chart-image', () => ({
  chartImageFilename: mocks.chartImageFilename,
  renderChartPng: mocks.renderChartPng
}));
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
  }
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
vi.mock('@/components/RecordDistributionChart', () => ({
  RecordDistributionChart: ({ isNumeric, measureLabel }: { isNumeric: boolean; measureLabel: string }) => (
    <svg data-is-numeric={String(isNumeric)} data-measure-label={measureLabel} data-testid="distribution-chart" />
  )
}));
vi.mock('@/components/RecordScatterChart', () => ({
  RecordScatterChart: ({
    measureLabel,
    trend,
    xLabel
  }: {
    measureLabel: string;
    trend?: { intercept: number; slope: number };
    xLabel: string;
  }) => (
    <svg
      data-measure-label={measureLabel}
      data-testid="scatter-chart"
      data-trend={JSON.stringify(trend ?? null)}
      data-x-label={xLabel}
    />
  )
}));

const instrument: AnyUnilingualFormInstrument = { ...unilingualFormInstrument.instance, measures: null };

const measureOptions: ListboxDropdownOption[] = [
  { key: 'score', label: 'Score' },
  { key: 'mood', label: 'Mood' }
];

const records = [{ __id__: 'record-1' }];

const seriesOf = (key: string): RecordChartSeries => ({
  color: '#111111',
  key,
  label: key,
  points: [{ time: 1, value: 3 }]
});

const renderGraph = ({
  displayedInstrument = instrument,
  instrumentId = 'hq-1',
  isNumeric = true,
  recordsBeforeFilter,
  recordsOnPage = records,
  search = {},
  series = [seriesOf('ALL')]
}: {
  displayedInstrument?: AnyUnilingualFormInstrument | null;
  instrumentId?: null | string;
  isNumeric?: boolean;
  /** The set before the collection-method and series filters ran; defaults to nothing excluded. */
  recordsBeforeFilter?: { __id__: string }[];
  recordsOnPage?: { __id__: string }[];
  search?: Partial<Search>;
  series?: RecordChartSeries[];
} = {}) => {
  mocks.useInstrumentHubRecords.mockReturnValue({
    allRecords: recordsBeforeFilter ?? recordsOnPage,
    instrument: displayedInstrument,
    instrumentId,
    records: recordsOnPage
  });
  mocks.useRecordChartSeries.mockReturnValue({ isNumeric, series });
  vi.spyOn(Route, 'useSearch').mockReturnValue({
    chart: 'scatter',
    colourBy: 'none',
    minDateKey: 'all',
    palette: 'default',
    ...search
  });
  const Component = Route.options.component!;
  return render(<Component />);
};

const downloadChart = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Download' }));
  await waitFor(() => expect(mocks.download).toHaveBeenCalled());
};

const lastSearch = () => {
  const [{ search }] = mocks.navigate.mock.lastCall as [{ search: (prev: object) => object }];
  return search({});
};

describe('Route', () => {
  beforeEach(() => {
    mocks.useLinearModelQuery.mockReturnValue({ data: { score: { intercept: 1, slope: 2, stdErr: 0.5 } } });
    mocks.useMeasureOptions.mockReturnValue(measureOptions);
    mocks.renderChartPng.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    vi.spyOn(Route, 'useNavigate').mockReturnValue(mocks.navigate);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('instrument graph route', () => {
    it('should chart the first measure until one is chosen, so the page is never blank', () => {
      renderGraph();
      expect(mocks.useRecordChartSeries).toHaveBeenLastCalledWith(
        expect.objectContaining({ measure: 'score', records })
      );
      expect(screen.getByTestId('scatter-chart').dataset.measureLabel).toBe('Score');
    });

    it('should chart the measure named in the url', () => {
      renderGraph({ search: { measure: 'mood' } });
      expect(screen.getByTestId('scatter-chart').dataset.measureLabel).toBe('Mood');
    });

    // A measure may be named in a shared link that this edition does not declare.
    it('should label the chart with nothing when the url names a measure the instrument lacks', () => {
      renderGraph({ search: { measure: 'absent' } });
      expect(screen.getByTestId('scatter-chart').dataset.measureLabel).toBe('');
    });

    // An instrument declaring no measures has nothing to chart, and the control must still render.
    it('should leave the measure control empty for an instrument with no measures', () => {
      mocks.useMeasureOptions.mockReturnValue([]);
      renderGraph();
      expect(screen.getByTestId('instrument-hub-measure-trigger').textContent).toBe(
        'Please select one or more measures'
      );
    });

    it('should offer the measures of the opened instrument', () => {
      renderGraph();
      expect(mocks.useMeasureOptions).toHaveBeenCalledWith(instrument);
    });

    it.each([
      ['measure', 'instrument-hub-measure-trigger', 'Mood', { measure: 'mood' }],
      ['grouping', 'instrument-hub-colour-by-trigger', 'By series', { colourBy: 'series' }]
    ])('should record the chosen %s in the url', (_, testId, option, expected) => {
      renderGraph();
      fireEvent.keyDown(screen.getByTestId(testId), { key: 'Enter' });
      fireEvent.click(screen.getByRole('option', { name: option }));
      expect(lastSearch()).toEqual(expected);
    });

    it('should record the chosen palette in the url', () => {
      renderGraph();
      fireEvent.click(screen.getByTestId('select-palette'));
      expect(lastSearch()).toEqual({ palette: 'jade' });
    });

    it('should record the chosen chart in the url', () => {
      renderGraph();
      fireEvent.mouseDown(screen.getByRole('tab', { name: 'Distribution' }), { button: 0, ctrlKey: false });
      expect(lastSearch()).toEqual({ chart: 'distribution' });
    });

    // The palette control previews only the hues the chart will reach, and an ungrouped chart draws
    // with exactly one.
    it('should preview one hue for an ungrouped chart and the grouping limit otherwise', () => {
      renderGraph();
      expect(screen.getByTestId('select-palette').dataset.slots).toBe('1');
      cleanup();
      renderGraph({ search: { colourBy: 'series' } });
      expect(screen.getByTestId('select-palette').dataset.slots).toBe('3');
    });

    it('should show the distribution when it is the chosen chart', () => {
      renderGraph({ search: { chart: 'distribution' } });
      expect(screen.getByTestId('distribution-chart').dataset.isNumeric).toBe('true');
      expect(screen.queryByTestId('scatter-chart')).toBeNull();
    });

    // A category has no position on a time axis, so a scatter of one would be meaningless.
    it('should explain that a categorical measure can only be shown as a distribution', () => {
      renderGraph({ isNumeric: false });
      expect(screen.queryByTestId('scatter-chart')).toBeNull();
      expect(screen.getByText(/can only be shown as a distribution/)).toBeTruthy();
    });

    it('should bin a categorical measure when the distribution is chosen', () => {
      renderGraph({ isNumeric: false, search: { chart: 'distribution' } });
      expect(screen.getByTestId('distribution-chart').dataset.isNumeric).toBe('false');
    });

    it('should say that nothing matches rather than drawing an empty chart', () => {
      renderGraph({ series: [{ color: '#111111', key: 'ALL', label: 'ALL', points: [] }] });
      expect(screen.queryByTestId('scatter-chart')).toBeNull();
      expect(screen.getByText('No records match the current filters.')).toBeTruthy();
    });

    it('should plot the collection date on the x axis', () => {
      renderGraph();
      expect(screen.getByTestId('scatter-chart').dataset.xLabel).toBe('Date Collected');
    });
  });

  describe('instrument graph trend', () => {
    it('should overlay the group trend for the charted measure', () => {
      renderGraph();
      expect(mocks.useLinearModelQuery).toHaveBeenLastCalledWith({
        enabled: true,
        params: { groupId: 'group-1', instrumentId: 'hq-1' }
      });
      expect(screen.getByTestId('scatter-chart').dataset.trend).toBe(
        JSON.stringify({ intercept: 1, slope: 2, stdErr: 0.5 })
      );
    });

    it('should not fetch the trend before the instrument is known', () => {
      renderGraph({ instrumentId: null });
      expect(mocks.useLinearModelQuery).toHaveBeenLastCalledWith({
        enabled: false,
        params: { groupId: 'group-1', instrumentId: null }
      });
    });

    it('should not fetch the trend for a measure holding categories, which no line fits', () => {
      renderGraph({ isNumeric: false });
      expect(mocks.useLinearModelQuery.mock.lastCall?.[0]).toMatchObject({ enabled: false });
    });

    // The regression describes the whole group, so drawing it over a subgroup would misdescribe it.
    it('should drop the trend once the records are split into groups', () => {
      renderGraph({ search: { colourBy: 'method' }, series: [seriesOf('REMOTE'), seriesOf('IN_PERSON')] });
      expect(mocks.useLinearModelQuery.mock.lastCall?.[0]).toMatchObject({ enabled: false });
      expect(screen.getByTestId('scatter-chart').dataset.trend).toBe('null');
    });

    // The regression describes the whole group, so it stops describing what is plotted the moment a
    // filter excludes a record.
    it('should drop the trend once a filter has excluded a record', () => {
      renderGraph({
        recordsBeforeFilter: [{ __id__: 'record-1' }, { __id__: 'record-2' }],
        recordsOnPage: [{ __id__: 'record-1' }]
      });
      expect(mocks.useLinearModelQuery.mock.lastCall?.[0]).toMatchObject({ enabled: false });
      expect(screen.getByTestId('scatter-chart').dataset.trend).toBe('null');
    });

    // Selecting every collection method, or every series, names a filter that excludes nothing. The
    // plotted set is still the whole group's, so the regression still describes it.
    it('should keep the trend for a filter that excludes nothing, such as every method selected', () => {
      renderGraph({ recordsBeforeFilter: [{ __id__: 'record-1' }], recordsOnPage: [{ __id__: 'record-1' }] });
      expect(mocks.useLinearModelQuery.mock.lastCall?.[0]).toMatchObject({ enabled: true });
      expect(screen.getByTestId('scatter-chart').dataset.trend).not.toBe('null');
    });

    // The timeframe is applied by the query that produced both sets, so they come back equally
    // bounded and no difference in length reveals it -- the chosen timeframe is what does.
    it('should drop the trend for a bounded timeframe, which the record counts cannot reveal', () => {
      renderGraph({ search: { minDateKey: 'pastYear' } });
      expect(mocks.useLinearModelQuery.mock.lastCall?.[0]).toMatchObject({ enabled: false });
      expect(screen.getByTestId('scatter-chart').dataset.trend).toBe('null');
    });

    it('should draw no trend when the instrument has no regression for the charted measure', () => {
      mocks.useLinearModelQuery.mockReturnValue({ data: {} });
      renderGraph();
      expect(screen.getByTestId('scatter-chart').dataset.trend).toBe('null');
    });
  });

  describe('instrument graph download', () => {
    it('should save the capture as a png named after the instrument', async () => {
      const blob = new Blob(['png'], { type: 'image/png' });
      mocks.renderChartPng.mockResolvedValue(blob);
      renderGraph();
      await downloadChart();
      const [filename, fetchData, options] = mocks.download.mock.lastCall as [string, () => Blob, object];
      expect(mocks.chartImageFilename).toHaveBeenCalledWith('Unilingual Form');
      expect(filename).toBe('Unilingual Form.png');
      expect(fetchData()).toBe(blob);
      expect(options).toEqual({ blobType: 'image/png' });
    });

    it('should caption the capture with the instrument and the charted measure', async () => {
      renderGraph();
      await downloadChart();
      expect(mocks.renderChartPng.mock.lastCall?.[1]).toMatchObject({ headings: ['Unilingual Form', 'Score'] });
    });

    // The catalog resolves after the first paint, so a capture taken immediately has no title to name.
    it('should caption the capture generically before the instrument is named', async () => {
      renderGraph({ displayedInstrument: null });
      await downloadChart();
      expect(mocks.renderChartPng.mock.lastCall?.[1]).toMatchObject({ headings: ['Instrument', 'Score'] });
    });

    // Only a grouped chart carries a legend on screen, and a one-entry legend restates the heading.
    it('should include a legend in the capture only once the chart is grouped', async () => {
      renderGraph();
      await downloadChart();
      expect(mocks.renderChartPng.mock.lastCall?.[1]).toMatchObject({ legend: [] });

      cleanup();
      mocks.download.mockClear();
      renderGraph({ search: { colourBy: 'method' }, series: [seriesOf('REMOTE'), seriesOf('IN_PERSON')] });
      await downloadChart();
      expect(mocks.renderChartPng.mock.lastCall?.[1]).toMatchObject({
        legend: [
          { color: '#111111', label: 'REMOTE' },
          { color: '#111111', label: 'IN_PERSON' }
        ]
      });
    });

    it('should disable the download when there are no records to capture', () => {
      renderGraph({ recordsOnPage: [] });
      expect(screen.getByRole('button', { name: 'Download' }).hasAttribute('disabled')).toBe(true);
    });

    it('should not capture anything once the chart has unmounted', async () => {
      const { unmount } = renderGraph();
      unmount();
      mocks.downloadSelection.current!('png');
      await act(() => Promise.resolve());
      expect(mocks.renderChartPng).not.toHaveBeenCalled();
      expect(mocks.download).not.toHaveBeenCalled();
    });

    // A download that quietly does nothing is indistinguishable from a broken button.
    it('should report the failure and save nothing when the capture cannot be rendered', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mocks.renderChartPng.mockRejectedValue(new Error('no chart on screen'));
      renderGraph();
      fireEvent.click(screen.getByRole('button', { name: 'Download' }));
      await waitFor(() => expect(mocks.addNotification).toHaveBeenCalled());
      expect(mocks.addNotification).toHaveBeenCalledWith({
        message: 'The chart could not be saved as an image: no chart on screen',
        type: 'error'
      });
      expect(mocks.download).not.toHaveBeenCalled();
    });

    it('should report a failure that is not an error, rather than letting it escape unreported', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mocks.renderChartPng.mockRejectedValue('canvas exploded');
      renderGraph();
      fireEvent.click(screen.getByRole('button', { name: 'Download' }));
      await waitFor(() => expect(mocks.addNotification).toHaveBeenCalled());
      expect(mocks.addNotification).toHaveBeenCalledWith({
        message: 'The chart could not be saved as an image: canvas exploded',
        type: 'error'
      });
    });
  });
});
