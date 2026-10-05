import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CHART_PALETTE_THEMES, MAX_CATEGORICAL_GROUPS, NEUTRAL_MARK, OTHER_GROUP_KEY } from '@/utils/chart-palette';

import { useRecordChartSeries } from '../useRecordChartSeries';

import type { InstrumentVisualizationRecord } from '../useInstrumentVisualization';

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useTheme: () => ['light'],
  useTranslation: () => ({ t: (value: string | { en: string }) => (typeof value === 'string' ? value : value.en) })
}));

const recordOf = (overrides: Partial<InstrumentVisualizationRecord>): InstrumentVisualizationRecord => ({
  __date__: new Date('2024-01-01'),
  __id__: 'record-1',
  __instrumentId__: 'instrument-1',
  __method__: 'IN_PERSON',
  __seriesId__: null,
  __seriesName__: null,
  __subjectId__: 'subject-1',
  __time__: 0,
  score: 1,
  ...overrides
});

type Options = Parameters<typeof useRecordChartSeries>[0];

const render = (options: Omit<Options, 'palette'> & { palette?: Options['palette'] }) =>
  renderHook(() => useRecordChartSeries({ palette: 'default', ...options })).result.current;

describe('useRecordChartSeries', () => {
  it('should produce nothing until a measure is chosen', () => {
    const { series } = render({ colourBy: 'none', measure: undefined, records: [recordOf({})] });
    expect(series).toStrictEqual([]);
  });

  it('should put every record in one series when no grouping is asked for', () => {
    const { series } = render({
      colourBy: 'none',
      measure: 'score',
      records: [recordOf({ __method__: 'IN_PERSON' }), recordOf({ __method__: 'REMOTE' })]
    });
    expect(series).toHaveLength(1);
    expect(series[0]!.points).toHaveLength(2);
  });

  // Without this the palette control would be inert until a grouping was chosen.
  it('should colour an ungrouped series from the chosen palette rather than a fixed grey', () => {
    const records = [recordOf({})];
    expect(render({ colourBy: 'none', measure: 'score', records }).series[0]!.color).toBe(
      CHART_PALETTE_THEMES.default.light[0]
    );
    expect(render({ colourBy: 'none', measure: 'score', palette: 'jade', records }).series[0]!.color).toBe(
      CHART_PALETTE_THEMES.jade.light[0]
    );
    expect(render({ colourBy: 'none', measure: 'score', records }).series[0]!.color).not.toBe(NEUTRAL_MARK.light);
  });

  it('should split records by collection method, which is why that column exists', () => {
    const { series } = render({
      colourBy: 'method',
      measure: 'score',
      records: [
        recordOf({ __method__: 'REMOTE' }),
        recordOf({ __method__: 'REMOTE' }),
        recordOf({ __method__: 'IN_PERSON' })
      ]
    });
    // The mocked translator echoes keys, so these are the session namespace's own labels — the
    // point being that the method labels are reused rather than written again for the chart.
    expect(series.map((item) => [item.label, item.points.length])).toStrictEqual([
      ['session.type.remote', 2],
      ['session.type.in-person', 1]
    ]);
  });

  it('should label records collected outside a series as individual when grouping by series', () => {
    const { series } = render({ colourBy: 'series', measure: 'score', records: [recordOf({})] });
    expect(series[0]!.label).toBe('Individual');
  });

  // Colour must follow the group, never its rank, so the biggest group always takes the first slot
  // and a group keeps its colour as the filters change the counts around it.
  it('should order groups by size, so the palette is assigned deterministically', () => {
    const { series } = render({
      colourBy: 'series',
      measure: 'score',
      records: [
        recordOf({ __seriesId__: 's1', __seriesName__: 'One' }),
        recordOf({ __seriesId__: 's2', __seriesName__: 'Two' }),
        recordOf({ __seriesId__: 's2', __seriesName__: 'Two' })
      ]
    });
    expect(series.map((item) => item.label)).toStrictEqual(['Two', 'One']);
  });

  it('should fold the groups past the palette into one Other series rather than inventing hues', () => {
    const records = Array.from({ length: MAX_CATEGORICAL_GROUPS + 2 }, (_, index) =>
      recordOf({ __seriesId__: `s${index}`, __seriesName__: `Series ${index}` })
    );
    const { series } = render({ colourBy: 'series', measure: 'score', records });

    expect(series).toHaveLength(MAX_CATEGORICAL_GROUPS + 1);
    const folded = series.at(-1)!;
    expect(folded.key).toBe(OTHER_GROUP_KEY);
    expect(folded.label).toBe('Other (2)');
    expect(folded.points).toHaveLength(2);
  });

  it('should report a measure holding text as non-numeric, since a scatter cannot plot it', () => {
    const { isNumeric } = render({
      colourBy: 'none',
      measure: 'score',
      records: [recordOf({ score: 'high' })]
    });
    expect(isNumeric).toBe(false);
  });

  it('should skip records with no value for the measure rather than plotting them as zero', () => {
    const { series } = render({
      colourBy: 'none',
      measure: 'score',
      records: [recordOf({ score: 1 }), recordOf({ score: null }), recordOf({ score: undefined })]
    });
    expect(series[0]!.points).toHaveLength(1);
  });
  // The palette is a search param, so a shared link has to reproduce the colours it was made with.
  it('should draw a group from the chosen palette theme rather than always the default', () => {
    const records = [recordOf({ __method__: 'REMOTE' })];
    const asDefault = render({ colourBy: 'method', measure: 'score', records });
    const asBerry = render({ colourBy: 'method', measure: 'score', palette: 'berry', records });

    expect(asDefault.series[0]!.color).toBe(CHART_PALETTE_THEMES.default.light[0]);
    expect(asBerry.series[0]!.color).toBe(CHART_PALETTE_THEMES.berry.light[0]);
  });

  // Colour follows the entity, not its rank, so the folded tail stays outside every theme.
  it('should keep the folded tail neutral whichever palette is chosen', () => {
    const records = Array.from({ length: MAX_CATEGORICAL_GROUPS + 2 }, (_, index) =>
      recordOf({ __seriesId__: `s${index}`, __seriesName__: `Series ${index}` })
    );
    const { series } = render({ colourBy: 'series', measure: 'score', palette: 'jade', records });
    expect(series.at(-1)!.color).toBe(NEUTRAL_MARK.light);
  });
});
