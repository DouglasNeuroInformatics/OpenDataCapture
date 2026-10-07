import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { $SessionType } from '@opendatacapture/schemas/session';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { TabLink } from '@/components/TabLink';
import { useInstrumentHubFacets } from '@/hooks/useInstrumentHubFacets';
import { COLOUR_BY_OPTIONS } from '@/hooks/useRecordChartSeries';
import { CHART_PALETTE_NAMES } from '@/utils/chart-palette';

const RouteComponent = () => {
  const params = Route.useParams();
  const search = Route.useSearch();
  const { t } = useTranslation();
  const { isSeries, title } = useInstrumentHubFacets();

  const basePathname = `/datahub/instruments/${params.instrumentId}`;

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {title ?? t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' })}
        </Heading>
      </PageHeader>
      <Link
        className="text-muted-foreground focus-visible:ring-ring mb-3 flex items-center gap-0.5 self-start rounded-sm text-[11px] font-semibold tracking-widest uppercase transition-colors hover:text-blue-600 focus-visible:ring-1 focus-visible:outline-hidden dark:hover:text-blue-400"
        data-testid="instrument-hub-back"
        params={search.fromSeries ? { instrumentId: search.fromSeries } : undefined}
        to={search.fromSeries ? '/datahub/instruments/$instrumentId/table' : '/datahub/instruments'}
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        {t({ en: 'Return', es: 'Volver', fr: 'Retour' })}
      </Link>
      {!isSeries && (
        <div className="mb-5 flex">
          <TabLink
            label={t('datahub.layout.tabs.table')}
            pathname={`${basePathname}/table`}
            testId="instrument-hub-table-tab"
          />
          <TabLink
            label={t('datahub.layout.tabs.graph')}
            pathname={`${basePathname}/graph`}
            testId="instrument-hub-graph-tab"
          />
        </div>
      )}
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
    fromSeries: z.string().optional(),
    measure: z.string().optional(),
    methods: $SessionType.array().optional(),
    minDate: z.coerce.date().optional(),
    palette: z.enum(CHART_PALETTE_NAMES).default('default'),
    series: z.string().array().optional()
  })
});
