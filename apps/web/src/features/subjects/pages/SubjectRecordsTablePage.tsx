import { RecordsTable } from '../components/RecordsTable';
import { VisualizationContextProvider } from '../context/VisualizationContext';
import { useSubjectPageTitle } from '../hooks/useSubjectPageTitle';

import { PageHeader } from '@/components';

export const SubjectRecordsTablePage = () => {
  const title = useSubjectPageTitle();
  return (
    <VisualizationContextProvider>
      <PageHeader title={title} />
      <RecordsTable />
    </VisualizationContextProvider>
  );
};

export default SubjectRecordsTablePage;
