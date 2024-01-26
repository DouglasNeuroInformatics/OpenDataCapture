import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';

import { TabLink } from './TabLink';

export const SubjectLayout = () => {
  const params = useParams();
  const { t } = useTranslation('subjects');

  const subjectId = params.subjectId!;
  const basePathname = `/subjects/${subjectId}`;

  return (
    <div className="h-full">
      <PageHeader title={t('layout.title', { id: subjectId.slice(0, 7) })} />
      <div className="mb-5 flex">
        {config.setup.isGatewayEnabled && (
          <TabLink label={t('layout.tabs.assignments')} pathname={`${basePathname}/assignments`} />
        )}
        <TabLink label={t('layout.tabs.table')} pathname={`${basePathname}/table`} />
        <TabLink label={t('layout.tabs.graph')} pathname={`${basePathname}/graph`} />
      </div>
      <Outlet />
    </div>
  );
};
