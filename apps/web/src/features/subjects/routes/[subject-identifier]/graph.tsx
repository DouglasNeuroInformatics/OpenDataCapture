import { RecordsGraph } from '../../components/RecordsGraph';
import { VisualizationContextProvider } from '../../context/VisualizationContext';

export const GraphPage = () => {
  return (
    <VisualizationContextProvider instrumentOptionsFilter={(instrument) => instrument.measures}>
      <RecordsGraph />
    </VisualizationContextProvider>
  );
};

