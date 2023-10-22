import type { Subject } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components/Spinner';
import { useFetch } from '@/hooks/useFetch';

import { SubjectsTable } from '../components/SubjectsTable';

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
