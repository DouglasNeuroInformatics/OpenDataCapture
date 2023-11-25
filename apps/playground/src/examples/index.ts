import developerHappinessQuestionnaire from './forms/developer-happiness.instrument?raw';
import genericForm from './forms/generic-form.instrument?raw';

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
  }
]);
