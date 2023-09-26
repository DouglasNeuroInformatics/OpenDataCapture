import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { RecordsGraph } from '../components/RecordsGraph';
import { VisualizationContextProvider } from '../context/VisualizationContext';

import { PageHeader } from '@/components';

export const SubjectRecordsGraphPage = () => {
  const params = useParams();
  const { t } = useTranslation();

  return (
    <VisualizationContextProvider instrumentOptionsFilter={(instrument) => instrument.measures}>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectIdentifier!.slice(0, 6)}`} />
      <RecordsGraph />
    </VisualizationContextProvider>
  );
};

export default SubjectRecordsGraphPage;
