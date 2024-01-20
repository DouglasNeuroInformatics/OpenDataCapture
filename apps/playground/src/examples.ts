import { clickTask, happinessQuestionnaire } from '@open-data-capture/instrument-library';

export type ExampleInstrumentData = {
  label: string;
  path: string;
  value: string;
};

export const examples: readonly ExampleInstrumentData[] = Object.freeze([
  {
    label: 'Happiness Questionnaire',
    path: 'happiness-questionnaire.ts',
    value: happinessQuestionnaire.source
  },
  {
    label: 'Click Task',
    path: 'click-task.tsx',
    value: clickTask.source
  }
]);

export const defaultExample = examples.find((instrument) => instrument.label === 'Click Task')!;
