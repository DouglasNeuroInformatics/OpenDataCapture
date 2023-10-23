import { RecordsTable } from '../../components/RecordsTable';
import { VisualizationContextProvider } from '../../context/VisualizationContext';

export const TablePage = () => {
  return (
    <VisualizationContextProvider>
      <RecordsTable />
    </VisualizationContextProvider>
  );
};

