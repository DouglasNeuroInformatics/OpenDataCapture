import { Select } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { CHART_PALETTE_NAMES, getPaletteSwatch } from '@/utils/chart-palette';
import type { ChartPaletteName } from '@/utils/chart-palette';
import { resolveTheme } from '@/utils/chart-theme';

/** The hues a palette would actually draw with, so the choice is visible rather than named. */
const PaletteSwatch = ({ palette, slots }: { palette: ChartPaletteName; slots: number }) => {
  const [theme] = useTheme();
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {getPaletteSwatch(palette, resolveTheme(theme))
        .slice(0, slots)
        .map((color) => (
          <span className="h-2.5 w-2.5 rounded-full" key={color} style={{ backgroundColor: color }} />
        ))}
    </span>
  );
};

type SelectChartPaletteProps = {
  'data-testid'?: string;
  onSelect: (palette: ChartPaletteName) => void;
  /** How many of the theme's hues the chart will actually draw with, so the swatch does not overpromise */
  slots: number;
  value: ChartPaletteName;
};

/**
 * The palette control shared by the instrument and subject graphs, so the two offer the same themes
 * under the same names and a chart means the same thing on either page.
 */
export const SelectChartPalette = ({ 'data-testid': testId, onSelect, slots, value }: SelectChartPaletteProps) => {
  const { t } = useTranslation();

  const paletteLabels: { [K in ChartPaletteName]: string } = {
    berry: t({ en: 'Berry', es: 'Baya', fr: 'Baie' }),
    default: t({ en: 'Default', es: 'Predeterminada', fr: 'Par défaut' }),
    ember: t({ en: 'Ember', es: 'Brasa', fr: 'Braise' }),
    jade: t({ en: 'Jade', es: 'Jade', fr: 'Jade' })
  };

  return (
    <Select value={value} onValueChange={(selected) => onSelect(selected as ChartPaletteName)}>
      <Select.Trigger className="min-w-36" data-testid={testId}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {CHART_PALETTE_NAMES.map((name) => (
            <Select.Item key={name} value={name}>
              <span className="flex items-center gap-2">
                <PaletteSwatch palette={name} slots={slots} />
                {paletteLabels[name]}
              </span>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
