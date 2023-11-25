import developerHappinessQuestionnaire from './forms/developer-happiness.instrument?raw';
import genericForm from './forms/generic-form.instrument?raw';
import basicInteractiveInstrument from './interactive/basic-interactive.instrument?raw';

export type ExampleInstrumentData = {
  label: string;
  path: string;
  value: string;
};

export const examples: readonly ExampleInstrumentData[] = Object.freeze([
  {
    label: 'Developer Happiness Questionnaire',
    path: 'developer-happiness-questionnaire.ts',
    value: developerHappinessQuestionnaire
  },
  {
    label: 'Generic Form',
    path: 'generic-form.ts',
    value: genericForm
  },
  {
    label: 'Basic Interactive',
    path: 'basic-interactive.tsx',
    value: basicInteractiveInstrument
  }
]);
