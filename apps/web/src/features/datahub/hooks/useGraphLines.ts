import { useEffect, useState } from 'react';

import type { LineGraphLine, ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

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

type UseGraphLinesOptions = {
  selectedMeasures: ListboxDropdownOption[];
};

export function useGraphLines({ selectedMeasures }: UseGraphLinesOptions) {
  const { resolvedLanguage, t } = useTranslation('common');
  const [lines, setLines] = useState<LineGraphLine[]>([]);

  useEffect(() => {
    const lines: LineGraphLine[] = [];
    for (let i = 0; i < selectedMeasures.length; i++) {
      const measure = selectedMeasures[i]!;
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
  }, [resolvedLanguage, selectedMeasures]);

  return lines;
}
