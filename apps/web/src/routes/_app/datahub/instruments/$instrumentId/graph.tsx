import { Select, Tabs } from '@douglasneuroinformatics/libui/components';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { RecordDistributionChart } from '@/components/RecordDistributionChart';
import { RecordScatterChart } from '@/components/RecordScatterChart';
import { useInstrumentHubRecords } from '@/hooks/useInstrumentHubRecords';
import { useLinearModelQuery } from '@/hooks/useLinearModelQuery';
import { useMeasureOptions } from '@/hooks/useMeasureOptions';
import { useRecordChartSeries } from '@/hooks/useRecordChartSeries';
import type { ColourBy } from '@/hooks/useRecordChartSeries';
import { useAppStore } from '@/store';
import { CHART_PALETTE_NAMES, getPaletteSwatch } from '@/utils/chart-palette';
import type { ChartPaletteName } from '@/utils/chart-palette';
import { resolveTheme } from '@/utils/chart-theme';

/**
 * The hues a palette would actually draw with, so the choice is visible rather than named. Shows
 * one dot when there is no grouping, because only the first slot is used then.
 */
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

const RouteComponent = () => {
  const navigate = Route.useNavigate();
  const { chart, colourBy, measure, palette } = Route.useSearch();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { instrument, instrumentId, records } = useInstrumentHubRecords();
  const { t } = useTranslation();

  const paletteLabels: { [K in ChartPaletteName]: string } = {
    berry: t({ en: 'Berry', es: 'Baya', fr: 'Baie' }),
    default: t({ en: 'Default', es: 'Predeterminada', fr: 'Par défaut' }),
    jade: t({ en: 'Jade', es: 'Jade', fr: 'Jade' })
  };

  const measureOptions = useMeasureOptions(instrument);
  const selectedMeasure = measure ?? measureOptions[0]?.key;
  const measureLabel = measureOptions.find((option) => option.key === selectedMeasure)?.label ?? '';

  const { isNumeric, series } = useRecordChartSeries({ colourBy, measure: selectedMeasure, palette, records });

  // The regression is a property of the instrument across the whole group, so it is only an honest
  // overlay when the plotted set has not been narrowed to a subgroup.
  const isTrendComparable = colourBy === 'none' && series.length <= 1;
  const linearModelQuery = useLinearModelQuery({
    enabled: Boolean(instrumentId) && isNumeric && isTrendComparable,
    params: { groupId: currentGroup?.id, instrumentId: instrumentId! }
  });
  const trend = isTrendComparable && selectedMeasure ? linearModelQuery.data?.[selectedMeasure] : undefined;

  const hasData = series.some((item) => item.points.length > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
        <Tabs
          value={chart}
          onValueChange={(value) => {
            void navigate({ search: (prev) => ({ ...prev, chart: value as 'distribution' | 'scatter' }) });
          }}
        >
          <Tabs.List data-testid="instrument-hub-chart-toggle">
            <Tabs.Trigger value="scatter">
              {t({ en: 'Over Time', es: 'A lo largo del tiempo', fr: 'Dans le temps' })}
            </Tabs.Trigger>
            <Tabs.Trigger value="distribution">
              {t({ en: 'Distribution', es: 'Distribución', fr: 'Distribution' })}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
        <div className="flex flex-col gap-2 lg:flex-row">
          <Select
            value={selectedMeasure ?? ''}
            onValueChange={(value) => {
              void navigate({ search: (prev) => ({ ...prev, measure: value }) });
            }}
          >
            <Select.Trigger className="min-w-48" data-testid="instrument-hub-measure-trigger">
              <Select.Value placeholder={t('datahub.visualization.selectMeasures')} />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {measureOptions.map((option) => (
                  <Select.Item key={option.key} value={option.key}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
          <Select
            value={colourBy}
            onValueChange={(value) => {
              void navigate({ search: (prev) => ({ ...prev, colourBy: value as ColourBy }) });
            }}
          >
            <Select.Trigger className="min-w-40" data-testid="instrument-hub-colour-by-trigger">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Item value="none">
                  {t({ en: 'No grouping', es: 'Sin agrupar', fr: 'Sans regroupement' })}
                </Select.Item>
                <Select.Item value="method">
                  {t({ en: 'By collection method', es: 'Por método', fr: 'Par méthode' })}
                </Select.Item>
                <Select.Item value="series">{t({ en: 'By series', es: 'Por serie', fr: 'Par série' })}</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select>
          <Select
            value={palette}
            onValueChange={(value) => {
              void navigate({ search: (prev) => ({ ...prev, palette: value as ChartPaletteName }) });
            }}
          >
            <Select.Trigger className="min-w-36" data-testid="instrument-hub-palette-trigger">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {CHART_PALETTE_NAMES.map((name) => (
                  <Select.Item key={name} value={name}>
                    <span className="flex items-center gap-2">
                      <PaletteSwatch palette={name} slots={colourBy === 'none' ? 1 : 3} />
                      {paletteLabels[name]}
                    </span>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
        </div>
      </div>
      <div
        className="bg-card text-muted-foreground rounded-md border p-6 tracking-tight shadow-xs"
        data-testid="instrument-hub-chart"
      >
        {!hasData ? (
          <p className="py-16 text-center">
            {t({
              en: 'No records match the current filters.',
              es: 'Ningún registro coincide con los filtros actuales.',
              fr: 'Aucun enregistrement ne correspond aux filtres actuels.'
            })}
          </p>
        ) : chart === 'distribution' ? (
          <RecordDistributionChart
            countLabel={t({ en: 'Records', es: 'Registros', fr: 'Enregistrements' })}
            isNumeric={isNumeric}
            measureLabel={measureLabel}
            series={series}
          />
        ) : !isNumeric ? (
          <p className="py-16 text-center">
            {t({
              en: 'This measure holds categories rather than numbers, so it can only be shown as a distribution.',
              es: 'Esta medida contiene categorías en lugar de números, por lo que solo puede mostrarse como distribución.',
              fr: 'Cette mesure contient des catégories et non des nombres : elle ne peut être affichée que sous forme de distribution.'
            })}
          </p>
        ) : (
          <RecordScatterChart
            measureLabel={measureLabel}
            series={series}
            trend={trend}
            xLabel={t('datahub.visualization.xLabel')}
          />
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/instruments/$instrumentId/graph')({
  component: RouteComponent
});
