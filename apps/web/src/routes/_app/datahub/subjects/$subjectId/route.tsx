import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { TabLink } from '@/components/TabLink';
import { config } from '@/config';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const params = Route.useParams();
  const search = Route.useSearch();
  const { t } = useTranslation('datahub');
  const subjectId = params.subjectId;
  const basePathname = `/datahub/subjects/${subjectId}`;
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t(
            {
              en: 'Instrument Records for Subject {}',
              es: 'Registros de instrumentos del sujeto {}',
              fr: "Dossiers d'instruments pour le client {}"
            },
            {
              args: [removeSubjectIdScope(subjectId).slice(0, subjectIdDisplaySetting ?? 9)]
            }
          )}
        </Heading>
      </PageHeader>
      {/* A subject reached from an instrument's record table belongs to that listing, not to the
          subject index — so the return goes back to where the reader actually was. */}
      <Link
        className="text-muted-foreground focus-visible:ring-ring mb-3 flex items-center gap-0.5 self-start rounded-sm text-[11px] font-semibold tracking-widest uppercase transition-colors hover:text-blue-600 focus-visible:ring-1 focus-visible:outline-hidden dark:hover:text-blue-400"
        data-testid="subject-hub-back"
        params={search.fromInstrument ? { instrumentId: search.fromInstrument } : undefined}
        search={search.fromInstrument ? { fromSeries: search.fromSeries } : undefined}
        to={search.fromInstrument ? '/datahub/instruments/$instrumentId/table' : '/datahub/subjects'}
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        {t({ en: 'Return', es: 'Volver', fr: 'Retour' })}
      </Link>
      <div className="mb-5 flex">
        <TabLink label={t('layout.tabs.table')} pathname={`${basePathname}/table`} testId="subject-table-tab" />
        <TabLink label={t('layout.tabs.graph')} pathname={`${basePathname}/graph`} testId="subject-graph" />
        {config.setup.isGatewayEnabled && (
          <TabLink
            label={t('layout.tabs.assignments')}
            pathname={`${basePathname}/assignments`}
            testId="subject-assignment"
          />
        )}
      </div>
      <React.Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </React.Suspense>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/datahub/subjects/$subjectId')({
  component: RouteComponent,
  validateSearch: z.object({
    /** The instrument whose record table this subject was opened from, if it was */
    fromInstrument: z.string().optional(),
    /** Carried through so returning to that instrument keeps its own return pointing at the series */
    fromSeries: z.string().optional()
  })
});
