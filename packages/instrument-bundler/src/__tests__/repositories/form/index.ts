import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please complete the form']
  },
  content: {
    q1: {
      kind: 'boolean',
      label: 'Question 1',
      variant: 'radio'
    },
    q2: {
      deps: ['q1'],
      kind: 'dynamic',
      render(data) {
        if (!data.q1) {
          return null;
        }
        return {
          kind: 'string',
          label: 'Question 2',
          variant: 'input'
        };
      }
    }
  },
  details: {
    description: 'This is a form instrument',
    license: 'Apache-2.0',
    title: 'Form Instrument Stub'
  },
  internal: {
    edition: 1,
    name: 'FORM_INSTRUMENT_STUB'
  },
  kind: 'FORM',
  language: 'en',
  measures: {},
  tags: ['<PLACEHOLDER>'],
  validationSchema: z.object({
    q1: z.boolean(),
    q2: z.string().optional()
  })
});
