import { RecordsTable } from '../components/RecordsTable';
import { VisualizationContextProvider } from '../context/VisualizationContext';

export const SubjectTablePage = () => {
  return (
    <VisualizationContextProvider>
      <RecordsTable />
    </VisualizationContextProvider>
  );
};

