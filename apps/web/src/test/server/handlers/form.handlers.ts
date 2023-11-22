import { formDataTypeSchema, type FormInstrumentSummary } from '@open-data-capture/common/instrument';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import { HttpResponse, http } from 'msw';

export const FormHandlers = [
  http.get('/v1/instruments/available?kind=form', () => {
    return HttpResponse.json<FormInstrument>({
      details: {
        description:
          '\n      The Brief Psychiatric Rating Scale is a rating scale which a clinician or researcher may use to\n      measure psychiatric symptoms such as depression, anxiety, hallucinations and unusual behavior.\n      The scale is one of the oldest, most widely used scales to measure psychotic symptoms and was\n      first published in 1962.',
        estimatedDuration: 30,
        instructions:  "\n      Please enter the score for the term which best describes the patient's condition. 0 = not assessed, 1 = not\n      present, 2 = very mild, 3 = mild, 4 = moderate, 5 = moderately severe, 6 = severe, 7 = extremely severe.",
        title: 'Brief Psychiatric Rating Scale'
      },
      id: '6557bcdc930d9604d6355516',
      kind: 'form',
      language: 'en',
      measures: {
        totalScore: {
          label: 'Total Score',
          value: (data: FormDataType) => 1
        }
      },
      name: 'BriefPsychiatricRatingScale',
      tags: ['Schizophrenia', 'Psychosis'],
      version: 1
    });
  })
];
