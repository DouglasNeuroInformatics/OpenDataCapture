import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { TabLink } from '@/components/TabLink';
import { config } from '@/config';
import { useAppStore } from '@/store';

const RouteComponent = () => {
  const params = Route.useParams();
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
  component: RouteComponent
});
