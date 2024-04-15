/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  name: 'PROGRAMMING_LANGUAGE_COMPETENCY',
  tags: ['Dynamic'],
  version: 1.0,
  content: {
    knowsJavaScript: {
      kind: 'boolean',
      label: 'Do you know JavaScript?',
      variant: 'radio'
    }
  },
  details: {
    description: 'This is an example of a complex form with conditional rendering and validation logic',
    estimatedDuration: 1,
    instructions: ['Please respond to all questions'],
    license: 'AGPL-3.0',
    title: 'Programming Language Competency'
  },
  validationSchema: z.object({
    knowsJavaScript: z.boolean()
  })
});
