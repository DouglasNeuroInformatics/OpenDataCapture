import { useTranslation } from 'react-i18next';
import { RxBarChart, RxTable } from 'react-icons/rx';
import { useParams } from 'react-router-dom';

import { VisualizationMode } from '../components/VisualizationMode';

import { PageHeader } from '@/components';

export const SubjectPage = () => {
  const params = useParams();
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={`${t('subjectPage.pageTitle')}: ${params.subjectIdentifier!.slice(0, 7)}`} />
      <div className="my-16 flex items-center justify-center gap-8">
        <VisualizationMode icon={<RxTable />} title={t('table')} to="table" />
        <VisualizationMode icon={<RxBarChart />} title={t('graph')} to="graph" />
      </div>
    </div>
  );
};

export default SubjectPage;
