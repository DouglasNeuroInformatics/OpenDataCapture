import type { FormInstrumentSummary } from '@open-data-capture/common/instrument';
import { HttpResponse, http } from 'msw';

export const FormHandlers = [
  http.get('/v1/instruments/available?kind=form', () => {
    return HttpResponse.json<FormInstrumentSummary>({
      details: {
        description:
          '\n      The Brief Psychiatric Rating Scale is a rating scale which a clinician or researcher may use to\n      measure psychiatric symptoms such as depression, anxiety, hallucinations and unusual behavior.\n      The scale is one of the oldest, most widely used scales to measure psychotic symptoms and was\n      first published in 1962.',
        title: 'Brief Psychiatric Rating Scale'
      },
      id: '6557bcdc930d9604d6355516',
      kind: 'form',
      language: 'en',
      measures: {
        totalScore: {
          label: 'Total Score'
        }
      },
      name: 'BriefPsychiatricRatingScale',
      tags: ['Schizophrenia', 'Psychosis'],
      version: 1
    });
  })
];
