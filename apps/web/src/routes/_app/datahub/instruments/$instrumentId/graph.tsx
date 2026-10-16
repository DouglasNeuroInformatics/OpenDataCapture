import { useRef } from 'react';

import { ActionDropdown, Select, Tabs } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { RecordDistributionChart } from '@/components/RecordDistributionChart';
import { RecordScatterChart } from '@/components/RecordScatterChart';
import { SelectChartPalette } from '@/components/SelectChartPalette';
import { useInstrumentHubRecords } from '@/hooks/useInstrumentHubRecords';
import { useLinearModelQuery } from '@/hooks/useLinearModelQuery';
import { useMeasureOptions } from '@/hooks/useMeasureOptions';
import { useRecordChartSeries } from '@/hooks/useRecordChartSeries';
import type { ColourBy } from '@/hooks/useRecordChartSeries';
import { useAppStore } from '@/store';
import { chartImageFilename, renderChartPng } from '@/utils/chart-image';
import { MAX_CATEGORICAL_GROUPS } from '@/utils/chart-palette';
import { resolveTheme } from '@/utils/chart-theme';

const RouteComponent = () => {
  const navigate = Route.useNavigate();
  const { chart, colourBy, measure, palette } = Route.useSearch();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { instrument, instrumentId, records } = useInstrumentHubRecords();
  const { t } = useTranslation();
  const downloadFile = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [theme] = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const title = instrument?.details.title ?? t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' });

  const measureOptions = useMeasureOptions(instrument);
  const selectedMeasure = measure ?? measureOptions[0]?.key;
  const measureLabel = measureOptions.find((option) => option.key === selectedMeasure)?.label ?? '';

  const handlePngDownload = async () => {
    if (!chartContainerRef.current) {
      return;
    }
    try {
      const blob = await renderChartPng(chartContainerRef.current, {
        headings: [title, measureLabel].filter(Boolean),
        // Only a grouped chart has a legend on screen, and only then does the capture need one.
        legend: series.length > 1 ? series.map((item) => ({ color: item.color, label: item.label })) : [],
        mode: resolveTheme(theme)
      });
      await downloadFile(chartImageFilename(title), () => blob, { blobType: 'image/png' });
    } catch (error) {
      console.error(error);
      addNotification({
        // The cause is named rather than swallowed: without it the toast says only that something
        // went wrong, which is no more actionable than the button doing nothing.
        message: `${t({
          en: 'The chart could not be saved as an image',
          es: 'No se pudo guardar el gráfico como imagen',
          fr: "Le graphique n'a pas pu être enregistré comme image"
        })}: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      });
    }
  };

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
          <SelectChartPalette
            data-testid="instrument-hub-palette-trigger"
            slots={colourBy === 'none' ? 1 : MAX_CATEGORICAL_GROUPS}
            value={palette}
            onSelect={(selected) => {
              void navigate({ search: (prev) => ({ ...prev, palette: selected }) });
            }}
          />
          <ActionDropdown
            data-testid="instrument-hub-graph-export-dropdown"
            disabled={records.length === 0}
            options={{ png: 'PNG' }}
            title={t('datahub.downloadInfo.download')}
            triggerClassName="min-w-32"
            onSelection={() => {
              void handlePngDownload();
            }}
          />
        </div>
      </div>
      <div
        className="bg-card text-muted-foreground rounded-md border p-6 tracking-tight shadow-xs"
        data-testid="instrument-hub-chart"
        ref={chartContainerRef}
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
