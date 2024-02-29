import { useEffect, useState } from 'react';

import type { LineGraphLine, SelectOption } from '@douglasneuroinformatics/ui/legacy';
import { useTranslation } from 'react-i18next';

const COLOR_PALETTE: readonly string[] = [
  '#D81B60',
  '#1E88E5',
  '#FD08FA',
  '#A06771',
  '#353A9B',
  '#D90323',
  '#9C9218',
  '#CF0583',
  '#4075A3'
];

export type UseGraphLinesOptions = {
  selectedMeasures: SelectOption[];
};

export function useGraphLines({ selectedMeasures }: UseGraphLinesOptions) {
  const { i18n, t } = useTranslation('common');
  const [lines, setLines] = useState<LineGraphLine[]>([]);

  useEffect(() => {
    const lines: LineGraphLine[] = [];
    for (let i = 0; i < selectedMeasures.length; i++) {
      const measure = selectedMeasures[i];
      lines.push({
        name: measure.label,
        stroke: COLOR_PALETTE[i],
        val: measure.key
      });
      lines.push({
        legendType: 'none',
        name: `${measure.label} (${t('groupTrend')})`,
        stroke: COLOR_PALETTE[i],
        strokeDasharray: '5 5',
        strokeWidth: 0.5,
        val: measure.key + 'Group'
      });
    }
    setLines(lines);
  }, [i18n.resolvedLanguage, selectedMeasures]);

  return lines;
}
