import { useMemo } from 'react';

import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { LineGraphLine } from '@/components/LineGraph';
import { getMeasureColor } from '@/utils/chart-palette';
import type { ChartPaletteName } from '@/utils/chart-palette';
import { resolveTheme } from '@/utils/chart-theme';

type UseGraphLinesOptions = {
  palette: ChartPaletteName;
  selectedMeasures: ListboxDropdownOption[];
};

export function useGraphLines({ palette, selectedMeasures }: UseGraphLinesOptions) {
  const { resolvedLanguage, t } = useTranslation('common');
  const [theme] = useTheme();
  const mode = resolveTheme(theme);

  return useMemo(() => {
    const lines: LineGraphLine[] = [];
    for (const [index, measure] of selectedMeasures.entries()) {
      const stroke = getMeasureColor(index, mode, palette);
      lines.push({
        name: measure.label,
        stroke,
        val: measure.key
      });
      lines.push({
        legendType: 'none',
        name: `${measure.label} (${t('groupTrend')})`,
        stroke,
        strokeDasharray: '5 5',
        strokeWidth: 0.5,
        val: measure.key + 'Group'
      });
    }
    return lines;
    // Keyed on `resolvedLanguage` rather than `t`, which is a fresh closure every render and would
    // make this memo recompute always. The language is what actually changes the trend label.
  }, [mode, palette, resolvedLanguage, selectedMeasures]);
}
