import { useRef, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, ListboxDropdown } from '@douglasneuroinformatics/libui/components';
import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { useDownload, useNotificationsStore, useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { LineGraph } from '@/components/LineGraph';
import { SelectChartPalette } from '@/components/SelectChartPalette';
import { SelectEdition } from '@/components/SelectEdition';
import { SelectInstrument } from '@/components/SelectInstrument';
import { TimeDropdown } from '@/components/TimeDropdown';
import { useGraphData } from '@/hooks/useGraphData';
import { useGraphLines } from '@/hooks/useGraphLines';
import { useInstrumentVisualization } from '@/hooks/useInstrumentVisualization';
import { useLinearModelQuery } from '@/hooks/useLinearModelQuery';
import { useMeasureOptions } from '@/hooks/useMeasureOptions';
import { useAppStore } from '@/store';
import { renderChartPng } from '@/utils/chart-image';
import { CHART_PALETTE_NAMES } from '@/utils/chart-palette';
import { inkColors, resolveTheme } from '@/utils/chart-theme';

const RouteComponent = () => {
  const downloadCanvas = useDownload();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const [theme] = useTheme();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const navigate = Route.useNavigate();
  const params = Route.useParams();
  const { palette } = Route.useSearch();
  const { editionOptions, instrument, instrumentId, instrumentOptions, minDate, records, setInstrumentId, setMinDate } =
    useInstrumentVisualization({
      params: {
        subjectId: params.subjectId
      }
    });
  const { t } = useTranslation();
  const measureOptions = useMeasureOptions(instrument);
  const [selectedMeasures, setSelectedMeasures] = useState<ListboxDropdownOption[]>([]);

  const linearModelQuery = useLinearModelQuery({
    enabled: Boolean(instrumentId),
    params: {
      groupId: currentGroup?.id,
      instrumentId: instrumentId!
    }
  });
  const graphData = useGraphData({
    models: linearModelQuery.data,
    records,
    selectedMeasures
  });

  const lines = useGraphLines({ palette, selectedMeasures });

  const graphContainerRef = useRef<HTMLDivElement>(null);

  const handleGraphDownload = async () => {
    if (!graphContainerRef.current) {
      return;
    }
    const subjectId = params.subjectId.slice(0, 7);
    const footnotes = [
      minDate
        ? t('datahub.downloadInfo.time') + toBasicISOString(minDate) + ' - ' + toBasicISOString(new Date())
        : t('datahub.downloadInfo.allTime')
    ];
    if (selectedMeasures.length > 0) {
      footnotes.unshift(
        t('datahub.downloadInfo.measurement') + selectedMeasures.map((measure) => measure.label).join(', ')
      );
    }
    try {
      const blob = await renderChartPng(graphContainerRef.current, {
        footnotes,
        headings: [t('datahub.downloadInfo.subjectText', { args: [instrument?.details.title ?? '', subjectId] })],
        // The trend lines carry `legendType: 'none'` on screen and are left out here for the same
        // reason: each one restates the measure it accompanies.
        legend: lines
          .filter((line) => line.legendType !== 'none')
          .map((line) => ({ color: line.stroke ?? inkColors[resolveTheme(theme)], label: line.name })),
        mode: resolveTheme(theme)
      });
      await downloadCanvas(`${subjectId}.png`, () => blob, { blobType: 'image/png' });
    } catch (error) {
      console.error(error);
      addNotification({
        message: `${t({
          en: 'The chart could not be saved as an image',
          es: 'No se pudo guardar el gráfico como imagen',
          fr: "Le graphique n'a pas pu être enregistré comme image"
        })}: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      });
    }
  };

  return (
    <div>
      <div className="mb-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-testid="instrument-select-dropdown-container">
              <SelectInstrument
                options={instrumentOptions}
                onSelect={(id) => {
                  setInstrumentId(id);
                  setSelectedMeasures([]);
                }}
              />
            </div>
            <div data-testid="edition-select-dropdown-container">
              <SelectEdition
                options={editionOptions}
                value={instrumentId}
                onSelect={(id) => {
                  setInstrumentId(id);
                  setSelectedMeasures([]);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-testid="measure-select-dropdown-container">
              <ListboxDropdown
                widthFull
                checkPosition="right"
                contentClassName="min-w-72"
                disabled={!instrumentId}
                options={measureOptions}
                selected={selectedMeasures}
                setSelected={setSelectedMeasures}
                title={t('datahub.visualization.measures')}
                variant="secondary"
              />
            </div>
            <div data-testid="time-select-dropdown-container">
              <TimeDropdown disabled={!instrumentId} setMinTime={setMinDate} />
            </div>
            <div data-testid="palette-select-dropdown-container">
              <SelectChartPalette
                slots={Math.max(selectedMeasures.length, 1)}
                value={palette}
                onSelect={(selected) => {
                  void navigate({ search: (prev) => ({ ...prev, palette: selected }) });
                }}
              />
            </div>
            <div className="relative w-full whitespace-nowrap" data-testid="download-button-container">
              <ActionDropdown
                widthFull
                disabled={!instrumentId}
                options={{
                  png: 'PNG'
                }}
                title={t('datahub.downloadInfo.download')}
                onSelection={() => {
                  void handleGraphDownload();
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="bg-card text-muted-foreground rounded-md border p-6 tracking-tight shadow-xs"
        data-testid="subject-graph-chart"
        ref={graphContainerRef}
      >
        <LineGraph
          data={graphData}
          lines={lines}
          xAxis={{
            key: '__time__',
            label: t('datahub.visualization.xLabel')
          }}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/subjects/$subjectId/graph')({
  component: RouteComponent,
  validateSearch: z.object({
    palette: z.enum(CHART_PALETTE_NAMES).default('default')
  })
});
