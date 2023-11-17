import type { BaseInstrument } from '@open-data-capture/common/instrument';
import { HttpResponse, http } from 'msw';

export const FormHandlers = [
    http.get('v1/available?kind=form', () => {
        return HttpResponse.json<BaseInstrument>(
            {
                details: {
                    description: "\n      The Brief Psychiatric Rating Scale is a rating scale which a clinician or researcher may use to\n      measure psychiatric symptoms such as depression, anxiety, hallucinations and unusual behavior.\n      The scale is one of the oldest, most widely used scales to measure psychotic symptoms and was\n      first published in 1962.",
                    estimatedDuration: 30,
                    instructions: "\n      Please enter the score for the term which best describes the patient's condition. 0 = not assessed, 1 = not\n      present, 2 = very mild, 3 = mild, 4 = moderate, 5 = moderately severe, 6 = severe, 7 = extremely severe.",
                    title: "Brief Psychiatric Rating Scale"
                },
                kind: "form",
                language: "en",
                name: "BriefPsychiatricRatingScale",
                tags: [
                    "Schizophrenia",
                    "Psychosis"
                ],
                version: 1,
                measures: {
                    totalScore: {
                        label: "Total Score"
                    }
                },
                id: "6557bcdc930d9604d6355516"
            }
        )
    })
]