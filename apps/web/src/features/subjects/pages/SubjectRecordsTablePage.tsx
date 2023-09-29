import { RecordsTable } from '../components/RecordsTable';
import { VisualizationContextProvider } from '../context/VisualizationContext';

export const SubjectRecordsTablePage = () => {
  return (
    <VisualizationContextProvider>
      <RecordsTable />
    </VisualizationContextProvider>
  );
};

export default SubjectRecordsTablePage;
