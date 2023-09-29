import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';

export const SubjectPage = () => {
  const params = useParams();
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectIdentifier!.slice(0, 7)}`} />
      <Outlet />
    </div>
  );
};

export default SubjectPage;
