import { describe, expect, it } from 'vitest';

import type { RecordChartSeries } from '@/hooks/useRecordChartSeries';
import { binDistribution } from '@/utils/distribution';

const seriesOf = (key: string, values: (number | string)[]): RecordChartSeries => ({
  color: '#000000',
  key,
  label: key,
  points: values.map((value, index) => ({ time: index, value }))
});

describe('binDistribution', () => {
  it('should return no rows for an empty set, so the chart can say there is nothing to show', () => {
    expect(binDistribution([], true)).toStrictEqual([]);
  });

  it('should count the maximum value rather than letting it overflow past the last bin', () => {
    const rows = binDistribution([seriesOf('all', [0, 10])], true);
    const total = rows.reduce((sum, row) => sum + (row.all as number), 0);
    expect(total).toBe(2);
    expect(rows.at(-1)!.all).toBe(1);
  });

  it('should total every value exactly once across the bins', () => {
    const values = [1, 2, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const rows = binDistribution([seriesOf('all', values)], true);
    expect(rows.reduce((sum, row) => sum + (row.all as number), 0)).toBe(values.length);
  });

  it('should give a measure whose every value is identical a single bin, having no range to divide', () => {
    const rows = binDistribution([seriesOf('all', [7, 7, 7])], true);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ all: 3, bin: '7' });
  });

  // Bins come from the combined range so a bar in one group describes the same interval as the bar
  // beside it; binning each series over its own range would make the groups incomparable.
  it('should bin every series over the shared range, so bars from different groups line up', () => {
    const rows = binDistribution([seriesOf('low', [0, 1]), seriesOf('high', [99, 100])], true);
    expect(rows[0]).toMatchObject({ high: 0, low: 2 });
    expect(rows.at(-1)).toMatchObject({ high: 2, low: 0 });
  });

  it('should give every series a zero in every bin, so a group absent from a bin renders as a gap rather than disappearing', () => {
    const rows = binDistribution([seriesOf('a', [0, 10]), seriesOf('b', [5])], true);
    for (const row of rows) {
      expect(row).toHaveProperty('a');
      expect(row).toHaveProperty('b');
    }
  });

  it('should count a categorical measure per distinct value instead of binning it', () => {
    const rows = binDistribution([seriesOf('all', ['yes', 'no', 'yes'])], false);
    expect(rows).toStrictEqual([
      { all: 1, bin: 'no' },
      { all: 2, bin: 'yes' }
    ]);
  });
});
