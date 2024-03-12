import React from 'react';

import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

import { LoadingFallback } from '@/components/LoadingFallback';
import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';

import { TabLink } from './TabLink';

export const SubjectLayout = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');

  const subjectId = params.subjectId!;
  const basePathname = `/subjects/${subjectId}`;

  return (
    <React.Fragment>
      <PageHeader title={t('layout.title', { id: subjectId.slice(0, 7) })} />
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
