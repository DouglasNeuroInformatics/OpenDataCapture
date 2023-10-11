import { RecordsGraph } from '../components/RecordsGraph';
import { VisualizationContextProvider } from '../context/VisualizationContext';

export const SubjectRecordsGraphPage = () => {
  return (
    <VisualizationContextProvider instrumentOptionsFilter={(instrument) => instrument.measures}>
      <RecordsGraph />
    </VisualizationContextProvider>
  );
};

export default SubjectRecordsGraphPage;
