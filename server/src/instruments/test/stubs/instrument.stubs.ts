import { FormInstrumentDto } from '@/instruments/dto/form-instrument.dto';

export const mockFormInstrumentDto: FormInstrumentDto = {
  title: 'Happiness Questionnaire',
  kind: 'form',
  details: {
    description: 'This questionnaire measure happiness',
    language: 'en',
    instructions: 'Please answer this question',
    estimatedDuration: 1,
    version: 1
  },
  data: [
    {
      name: 'overallHappiness',
      label: 'Overall Happiness',
      description: 'Overall Happiness (1-10)',
      variant: 'text',
      isRequired: true
    }
  ]
};
