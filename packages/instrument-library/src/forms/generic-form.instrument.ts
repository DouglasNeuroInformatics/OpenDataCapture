/* eslint-disable perfectionist/sort-object-types */
/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  name: 'GenericInstrument',
  tags: ['Example'],
  version: 1.0,
  content: {
    binaryCheck: {
      kind: 'boolean',
      label: 'Checkbox',
      variant: 'checkbox'
    },
    binaryRadio: {
      kind: 'boolean',
      label: 'Radio',
      variant: 'radio'
    },
    date: {
      kind: 'date',
      label: 'Date'
    },
    numericDefault: {
      kind: 'number',
      label: 'Numeric (Default)',
      variant: 'input'
    },
    numericSlider: {
      kind: 'number',
      label: 'Numeric (Slider)',
      variant: 'slider',
      min: 0,
      max: 10
    },
    optionsField: {
      kind: 'string',
      label: 'Options',
      options: {
        a: 'Option A',
        b: 'Option B',
        c: 'Option C'
      },
      variant: 'select'
    },
    textLong: {
      kind: 'string',
      label: 'Long Text',
      variant: 'textarea'
    },
    textShort: {
      kind: 'string',
      label: 'Short Text',
      variant: 'input'
    },
    textPassword: {
      kind: 'string',
      label: 'Password',
      variant: 'password'
    },
    arrayField: {
      kind: 'record-array',
      label: 'Array Field',
      fieldset: {
        name: {
          kind: 'string',
          label: 'Name',
          variant: 'input'
        }
      }
    }
  },
  details: {
    description: 'This example includes a variety of possible field types',
    title: 'Generic Instrument',
    estimatedDuration: 5,
    instructions: ['Please complete all questions'],
    license: 'AGPL-3.0'
  },
  validationSchema: z.object({
    binaryCheck: z.boolean(),
    binaryRadio: z.boolean(),
    date: z.date(),
    numericDefault: z.number(),
    numericSlider: z.number(),
    optionsField: z.enum(['a', 'b', 'c']),
    textLong: z.string(),
    textPassword: z.string(),
    textShort: z.string(),
    arrayField: z.array(
      z.object({
        name: z.string()
      })
    )
  })
});
