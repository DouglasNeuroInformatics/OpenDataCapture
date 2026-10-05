import { useMemo } from 'react';

import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { useCollectionMethodLabels } from '@/hooks/useCollectionMethodLabels';
import type { InstrumentVisualizationRecord } from '@/hooks/useInstrumentVisualization';
import { getCategoricalColor, MAX_CATEGORICAL_GROUPS, NEUTRAL_MARK, OTHER_GROUP_KEY } from '@/utils/chart-palette';
import type { ChartPaletteName } from '@/utils/chart-palette';

type ColourBy = 'method' | 'none' | 'series';

type RecordChartPoint = {
  time: number;
  value: number | string;
};

type RecordChartSeries = {
  color: string;
  key: string;
  label: string;
  points: RecordChartPoint[];
};

type UseRecordChartSeriesOptions = {
  colourBy: ColourBy;
  measure: string | undefined;
  palette: ChartPaletteName;
  records: InstrumentVisualizationRecord[];
};

/**
 * Splits records into one coloured series per value of the grouping dimension, carrying the
 * selected measure.
 *
 * Groups are ordered by size and the tail beyond the palette's three slots folds into one "Other"
 * series, so a colour always means the same group no matter how many exist, and a grouping with
 * many values degrades rather than inventing hues.
 */
export function useRecordChartSeries({ colourBy, measure, palette, records }: UseRecordChartSeriesOptions): {
  isNumeric: boolean;
  series: RecordChartSeries[];
} {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const collectionMethodLabels = useCollectionMethodLabels();

  const unlabelled = t({ en: 'Unknown', es: 'Desconocido', fr: 'Inconnu' });
  const individual = t({ en: 'Individual', es: 'Individual', fr: 'Individuel' });
  const ungrouped = t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' });
  const other = t({ en: 'Other', es: 'Otros', fr: 'Autres' });

  return useMemo(() => {
    const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
    if (!measure) {
      return { isNumeric: true, series: [] };
    }

    const groupOf = (record: InstrumentVisualizationRecord): { key: string; label: string } => {
      switch (colourBy) {
        case 'method':
          return record.__method__
            ? { key: record.__method__, label: collectionMethodLabels[record.__method__] }
            : { key: 'UNKNOWN', label: unlabelled };
        case 'none':
          return { key: 'ALL', label: ungrouped };
        case 'series':
          return record.__seriesId__
            ? { key: record.__seriesId__, label: record.__seriesName__ ?? record.__seriesId__ }
            : { key: 'NONE', label: individual };
      }
    };

    let isNumeric = true;
    const groups = new Map<string, { label: string; points: RecordChartPoint[] }>();
    for (const record of records) {
      const value = record[measure];
      if (value === null || value === undefined) {
        continue;
      }
      if (typeof value !== 'number') {
        isNumeric = false;
      }
      if (typeof value !== 'number' && typeof value !== 'string') {
        continue;
      }
      const { key, label } = groupOf(record);
      let group = groups.get(key);
      if (!group) {
        group = { label, points: [] };
        groups.set(key, group);
      }
      group.points.push({ time: record.__time__, value });
    }

    const ranked = Array.from(groups, ([key, group]) => ({ key, ...group })).sort(
      (a, b) => b.points.length - a.points.length
    );

    // Ungrouped, every record is one series, which takes the chosen theme's first slot — so the
    // palette control still does something without a grouping. Grey is left to mean "not a real
    // group", which here is only the folded tail below.
    if (colourBy === 'none') {
      return {
        isNumeric,
        series: ranked.map((group) => ({ ...group, color: getCategoricalColor(0, resolvedTheme, palette) }))
      };
    }

    const series: RecordChartSeries[] = ranked.slice(0, MAX_CATEGORICAL_GROUPS).map((group, index) => ({
      ...group,
      color: getCategoricalColor(index, resolvedTheme, palette)
    }));
    const tail = ranked.slice(MAX_CATEGORICAL_GROUPS);
    if (tail.length > 0) {
      series.push({
        color: NEUTRAL_MARK[resolvedTheme],
        key: OTHER_GROUP_KEY,
        label: `${other} (${tail.length})`,
        points: tail.flatMap((group) => group.points)
      });
    }
    return { isNumeric, series };
  }, [colourBy, collectionMethodLabels, individual, measure, other, palette, records, theme, ungrouped, unlabelled]);
}

export type { ColourBy, RecordChartPoint, RecordChartSeries };
