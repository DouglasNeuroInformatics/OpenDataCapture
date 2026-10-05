import type { RecordChartSeries } from '@/hooks/useRecordChartSeries';

/** One bar group: the bin's label plus a count per series key */
type DistributionRow = {
  [seriesKey: string]: number | string;
  bin: string;
};

const TARGET_BIN_COUNT = 10;

/**
 * Counts each series' values into shared bins.
 *
 * Bins span the range of every series at once rather than each series' own range, so bars from
 * different groups describe the same interval and can be compared. A categorical measure is counted
 * per distinct value instead, since binning a category is meaningless.
 */
function binDistribution(series: RecordChartSeries[], isNumeric: boolean): DistributionRow[] {
  if (!isNumeric) {
    const categories = new Map<string, DistributionRow>();
    for (const item of series) {
      for (const point of item.points) {
        const category = String(point.value);
        let row = categories.get(category);
        if (!row) {
          row = { bin: category };
          categories.set(category, row);
        }
        row[item.key] = ((row[item.key] as number | undefined) ?? 0) + 1;
      }
    }
    return Array.from(categories.values()).sort((a, b) => a.bin.localeCompare(b.bin));
  }

  const values = series.flatMap((item) => item.points.map((point) => Number(point.value)));
  if (values.length === 0) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  // A measure whose every record holds the same value has no range to divide, so it gets one bin.
  const binCount = min === max ? 1 : TARGET_BIN_COUNT;
  const binWidth = min === max ? 1 : (max - min) / binCount;

  const rows = Array.from({ length: binCount }, (_, index): DistributionRow => {
    const start = min + index * binWidth;
    const end = index === binCount - 1 ? max : start + binWidth;
    const row: DistributionRow = {
      bin: binCount === 1 ? String(min) : `${start.toFixed(1)}–${end.toFixed(1)}`
    };
    for (const item of series) {
      row[item.key] = 0;
    }
    return row;
  });

  for (const item of series) {
    for (const point of item.points) {
      // The final bin is closed at the top, so the maximum value is counted rather than overflowing.
      const index = Math.min(binCount - 1, Math.floor((Number(point.value) - min) / binWidth));
      const row = rows[index]!;
      row[item.key] = ((row[item.key] as number | undefined) ?? 0) + 1;
    }
  }
  return rows;
}

export { binDistribution };
export type { DistributionRow };
