import type { Subject } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { SubjectsTable } from '../components/SubjectsTable';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';

export const ViewSubjectsPage = () => {
  const { data } = useFetch<Subject[]>('/v1/subjects');
  const { t } = useTranslation();

  if (!data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={t('viewSubjects.pageTitle')} />
      <SubjectsTable data={data} />
    </div>
  );
};

export default ViewSubjectsPage;
