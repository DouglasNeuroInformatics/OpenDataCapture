import {
  breakoutTask,
  clickTask,
  emptyBilingualForm,
  emptyInteractiveInstrument,
  emptyUnilingualForm,
  genericFormInstrument,
  happinessQuestionnaire
} from '@opendatacapture/instrument-library';

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
    label: 'Empty Unilingual Form',
    path: 'empty-unilingual-form.ts',
    value: emptyUnilingualForm.source
  },
  {
    label: 'Empty Bilingual Form',
    path: 'empty-bilingual-form.ts',
    value: emptyBilingualForm.source
  },
  {
    label: 'Generic Form Example',
    path: 'generic-form-example.ts',
    value: genericFormInstrument.source
  },
  {
    label: 'Empty Interactive',
    path: 'empty-interactive.ts',
    value: emptyInteractiveInstrument.source
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
