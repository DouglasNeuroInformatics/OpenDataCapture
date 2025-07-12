import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { Outlet, useParams } from 'react-router-dom';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';
import { useAppStore } from '@/store';

import { TabLink } from './TabLink';

export const SubjectLayout = () => {
  const params = useParams();
  const { t } = useTranslation('datahub');
  const subjectId = params.subjectId!;
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
