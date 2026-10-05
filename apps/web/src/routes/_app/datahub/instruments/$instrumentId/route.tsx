import React, { useState } from 'react';

import { Button, DropdownMenu, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $SessionType } from '@opendatacapture/schemas/session';
import type { SessionType } from '@opendatacapture/schemas/session';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ChevronDownIcon } from 'lucide-react';
import { z } from 'zod/v4';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { SelectEdition } from '@/components/SelectEdition';
import { TabLink } from '@/components/TabLink';
import { TimeDropdown } from '@/components/TimeDropdown';
import { useCollectionMethodLabels } from '@/hooks/useCollectionMethodLabels';
import { NO_SERIES, useInstrumentHubFacets } from '@/hooks/useInstrumentHubFacets';
import { COLOUR_BY_OPTIONS } from '@/hooks/useRecordChartSeries';
import { CHART_PALETTE_NAMES } from '@/utils/chart-palette';

const COLLECTION_METHODS = $SessionType.options;

/** Shown for the series option standing in for records collected outside any series */
const INDIVIDUAL_LABEL_KEY = 'individual';

const Filters = ({ seriesOptions }: { seriesOptions: Map<string, null | string> }) => {
  const navigate = Route.useNavigate();
  const { methods, series } = Route.useSearch();
  const { t } = useTranslation();
  const collectionMethodLabels = useCollectionMethodLabels();

  const [isOpen, setIsOpen] = useState(false);

  // An absent `methods`/`series` search param means every one of them; the dropdown has to
  // materialise that into an explicit list before it can remove one from it.
  const selectedMethods = methods ?? COLLECTION_METHODS;
  const selectedSeries = series ?? Array.from(seriesOptions.keys());

  const setMethods = (next: SessionType[]) => {
    void navigate({ search: (prev) => ({ ...prev, methods: next }) });
  };
  const setSeries = (next: string[]) => {
    void navigate({ search: (prev) => ({ ...prev, series: next }) });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          className="flex items-center justify-between gap-2"
          data-testid="instrument-hub-filters-trigger"
          variant="outline"
        >
          {t('common.filters')}
          <ChevronDownIcon className="opacity-50" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-64">
        <DropdownMenu.Label>
          {t({ en: 'Collection method', es: 'Método de recopilación', fr: 'Méthode de collecte' })}
        </DropdownMenu.Label>
        <DropdownMenu.Group>
          {COLLECTION_METHODS.map((method) => (
            <DropdownMenu.CheckboxItem
              checked={selectedMethods.includes(method)}
              data-testid={`instrument-hub-filter-method-${method}`}
              key={method}
              onCheckedChange={(checked) => {
                setMethods(checked ? [...selectedMethods, method] : selectedMethods.filter((item) => item !== method));
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {collectionMethodLabels[method]}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Group>
        <DropdownMenu.Label>{t({ en: 'Series', es: 'Serie', fr: 'Série' })}</DropdownMenu.Label>
        <DropdownMenu.Group>
          {Array.from(seriesOptions, ([id, name]) => (
            <DropdownMenu.CheckboxItem
              checked={selectedSeries.includes(id)}
              data-testid={`instrument-hub-filter-series-${id === NO_SERIES ? INDIVIDUAL_LABEL_KEY : id}`}
              key={id}
              onCheckedChange={(checked) => {
                setSeries(checked ? [...selectedSeries, id] : selectedSeries.filter((item) => item !== id));
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {/* A record may name a series the caller cannot read, leaving the id as the only label */}
              {id === NO_SERIES ? t({ en: 'Individual', es: 'Individual', fr: 'Individuel' }) : (name ?? id)}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const RouteComponent = () => {
  const navigate = Route.useNavigate();
  const params = Route.useParams();
  const search = Route.useSearch();
  const { t } = useTranslation();
  const { editionOptions, isSeries, seriesOptions, title } = useInstrumentHubFacets();

  const basePathname = `/datahub/instruments/${params.instrumentId}`;

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {title ?? t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' })}
        </Heading>
      </PageHeader>
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-2 lg:flex-row">
          {!isSeries && (
            <SelectEdition
              options={editionOptions}
              value={params.instrumentId}
              onSelect={(id) => {
                void navigate({ params: { instrumentId: id }, search, to: '.' });
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 lg:flex-row">
          <TimeDropdown
            setMinTime={(minDate) => {
              void navigate({ search: (prev) => ({ ...prev, minDate: minDate ?? undefined }) });
            }}
          />
          <Filters seriesOptions={isSeries ? new Map() : seriesOptions} />
        </div>
      </div>
      {/* A series has one view, so a lone "Table" tab would label nothing. */}
      <div className={isSeries ? 'mb-5' : 'mb-5 flex'}>
        {!isSeries && (
          <TabLink
            label={t('datahub.layout.tabs.table')}
            pathname={`${basePathname}/table`}
            testId="instrument-hub-table-tab"
          />
        )}
        {/* A series spans instruments with no measure in common, so there is nothing to plot. */}
        {!isSeries && (
          <TabLink
            label={t('datahub.layout.tabs.graph')}
            pathname={`${basePathname}/graph`}
            testId="instrument-hub-graph-tab"
          />
        )}
      </div>
      <React.Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </React.Suspense>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/datahub/instruments/$instrumentId')({
  component: RouteComponent,
  validateSearch: z.object({
    chart: z.enum(['scatter', 'distribution']).default('scatter'),
    colourBy: z.enum(COLOUR_BY_OPTIONS).default('none'),
    /**
     * One measure, not several: both chart forms put the measure on an axis and spend colour on the
     * grouping dimension instead, and a second measure of a different scale would need a second
     * y-axis.
     */
    measure: z.string().optional(),
    /** Absent means every method, which an empty array deliberately does not */
    methods: $SessionType.array().optional(),
    minDate: z.coerce.date().optional(),
    palette: z.enum(CHART_PALETTE_NAMES).default('default'),
    /** Absent means every series, which an empty array deliberately does not */
    series: z.string().array().optional()
  })
});
