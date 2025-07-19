import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';
import { useAppStore } from '@/store';

const TabLink = ({ dataCy, label, pathname }: { dataCy?: string; label: string; pathname: string }) => {
  const location = useLocation();
  const isActive = location.pathname === pathname;
  return (
    <Link
      className={cn(
        'grow border-b px-1 py-3 text-center font-medium',
        isActive ? 'border-sky-500 text-slate-900 dark:text-slate-100' : 'border-slate-300 dark:border-slate-700'
      )}
      data-cy={dataCy}
      data-nav-url={pathname}
      data-spotlight-type="tab-link"
      to={pathname}
    >
      {label}
    </Link>
  );
};

const RouteComponent = () => {
  const params = Route.useParams();
  const { t } = useTranslation('datahub');
  const subjectId = params.subjectId;
  const basePathname = `/datahub/${subjectId}`;
  const subjectIdDisplaySetting = useAppStore((store) => store.currentGroup?.settings.subjectIdDisplayLength);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t(
            {
              en: 'Instrument Records for Subject {}',
              fr: "Dossiers d'instruments pour le client {}"
            },
            {
              args: [removeSubjectIdScope(subjectId).slice(0, subjectIdDisplaySetting ?? 9)]
            }
          )}
        </Heading>
      </PageHeader>
      <div className="mb-5 flex">
        {config.setup.isGatewayEnabled && (
          <TabLink
            dataCy="subject-assignment"
            label={t('layout.tabs.assignments')}
            pathname={`${basePathname}/assignments`}
          />
        )}
        <TabLink dataCy="subject-table" label={t('layout.tabs.table')} pathname={`${basePathname}/table`} />
        <TabLink dataCy="subject-graph" label={t('layout.tabs.graph')} pathname={`${basePathname}/graph`} />
      </div>
      <React.Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </React.Suspense>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/datahub/$subjectId')({
  component: RouteComponent
});
