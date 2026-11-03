import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentKind } from '@opendatacapture/runtime-core';

import { ColorTagCell } from '@/components/ColorTagCell';
import { useInstrumentKindLabels } from '@/hooks/useInstrumentKindLabels';
import { resolveTheme } from '@/utils/chart-theme';
import { getInstrumentKindColor } from '@/utils/tag-colors';

type InstrumentKindCellProps = {
  kind: InstrumentKind;
};

/** A kind tag, matching the treatment the subject table gives sex. */
export const InstrumentKindCell = ({ kind }: InstrumentKindCellProps) => {
  const [theme] = useTheme();
  const labels = useInstrumentKindLabels();
  return (
    <ColorTagCell
      color={getInstrumentKindColor(kind, resolveTheme(theme))}
      data-testid="instrument-cell-kind"
      label={labels[kind]}
    />
  );
};
