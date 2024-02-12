import { breakoutTask, clickTask, happinessQuestionnaire } from '@open-data-capture/instrument-library';

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
  },
  {
    label: 'Breakout Task',
    path: 'breakout-task.tsx',
    value: breakoutTask.source
  }
]);

export const defaultExample = examples.at(-1)!;
