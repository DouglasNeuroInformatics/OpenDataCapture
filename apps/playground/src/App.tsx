import happinessQuestionnaire from '@open-data-capture/instruments/forms/happiness-questionnaire?raw';
import { Editor } from '@open-data-capture/react-core/components/Editor';

export const App = () => {
  return (
    <div className="h-screen">
      <Editor
        files={[
          {
            content: happinessQuestionnaire,
            path: 'happiness-questionnaire.ts'
          }
        ]}
      />
    </div>
  );
};
