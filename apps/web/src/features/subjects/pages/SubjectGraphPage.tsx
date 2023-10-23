import { RecordsGraph } from '../components/RecordsGraph';
import { VisualizationContextProvider } from '../context/VisualizationContext';

export const SubjectGraphPage = () => {
  return (
    <VisualizationContextProvider instrumentOptionsFilter={(instrument) => instrument.measures}>
      <RecordsGraph />
    </VisualizationContextProvider>
  );
};

