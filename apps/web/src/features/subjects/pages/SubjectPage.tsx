import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components';

export const SubjectPage = () => {
  const { t } = useTranslation();
  const params = useParams();

  return (
    <div>
      <PageHeader
        title={t('subjectPage.pageTitle', {
          id: params.subjectIdentifier!.slice(0, 7)
        })}
      />
    </div>
  );
};

export default SubjectPage;
