/* eslint-disable perfectionist/sort-objects */

import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  tags: ['Reference'],
  internal: {
    edition: 1,
    name: 'FORM_REFERENCE'
  },
  content: [
    {
      title: 'Boolean',
      fields: {
        booleanCheckbox: {
          kind: 'boolean',
          label: 'Boolean (Checkbox)',
          variant: 'checkbox'
        },
        booleanRadio: {
          kind: 'boolean',
          label: 'Boolean (Radio)',
          variant: 'radio'
        }
      }
    },
    {
      title: 'Date',
      fields: {
        date: {
          kind: 'date',
          label: 'Date'
        }
      }
    },
    {
      title: 'Number',
      fields: {
        numberInput: {
          kind: 'number',
          label: 'Number (Input)',
          variant: 'input'
        },
        numberRadio: {
          kind: 'number',
          label: 'Number (Radio)',
          options: {
            1: 'Low',
            2: 'Medium',
            3: 'High'
          },
          variant: 'radio'
        },
        numberSelect: {
          kind: 'number',
          label: 'Number (Select)',
          options: {
            1: 'Low',
            2: 'Medium',
            3: 'High'
          },
          variant: 'select'
        },
        numberSlider: {
          kind: 'number',
          label: 'Number (Slider)',
          variant: 'slider',
          min: 0,
          max: 10
        }
      }
    },
    {
      title: 'String',
      fields: {
        stringInput: {
          kind: 'string',
          label: 'String (Input)',
          variant: 'input'
        },
        stringPassword: {
          kind: 'string',
          label: 'String (Password)',
          variant: 'password'
        },
        stringRadio: {
          kind: 'string',
          label: 'String (Radio)',
          variant: 'radio',
          options: {
            a: 'A',
            b: 'B',
            c: 'C'
          }
        },
        stringSelect: {
          kind: 'string',
          label: 'String (Select)',
          variant: 'select',
          options: {
            a: 'A',
            b: 'B',
            c: 'C'
          }
        },
        stringTextArea: {
          kind: 'string',
          label: 'String (Text Area)',
          variant: 'textarea'
        }
      }
    },
    {
      title: 'Set',
      fields: {
        setListbox: {
          kind: 'set',
          label: 'Set (Listbox)',
          variant: 'listbox',
          options: {
            a: 'A',
            b: 'B',
            c: 'C'
          }
        },
        setSelect: {
          kind: 'set',
          label: 'Set (Select)',
          variant: 'select',
          options: {
            a: 'A',
            b: 'B',
            c: 'C'
          }
        }
      }
    },
    {
      title: 'Number Record',
      description: 'Note: this is a composite field',
      fields: {
        numberRecord: {
          kind: 'number-record',
          label: 'Number Record (Likert)',
          items: {
            q1: {
              label: 'Question 1'
            },
            q2: {
              label: 'Question 2'
            },
            q3: {
              label: 'Question 3'
            }
          },
          options: {
            1: 'Low',
            2: 'Medium',
            3: 'High'
          },
          variant: 'likert'
        }
      }
    },
    {
      title: 'Record Array',
      description: 'Note: this is a composite field',
      fields: {
        recordArray: {
          kind: 'record-array',
          label: 'Record Array',
          fieldset: {
            f1: {
              kind: 'string',
              label: 'Field 1',
              variant: 'input'
            },
            f2: {
              kind: 'string',
              label: 'Field 2',
              variant: 'input'
            }
          }
        }
      }
    }
  ],
  details: {
    description: 'This example includes all possible static field variants',
    title: 'Reference Instrument',
    estimatedDuration: 5,
    instructions: ['Please complete all questions'],
    license: 'Apache-2.0'
  },
  measures: {},
  validationSchema: z.object({
    booleanCheckbox: z.boolean(),
    booleanRadio: z.boolean(),
    date: z.date(),
    numberInput: z.number(),
    numberRadio: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    numberSelect: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    numberSlider: z.number(),
    stringInput: z.string(),
    stringPassword: z
      .string()
      .regex(
        /"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"/,
        'Password must contain eight or more characters and at least one letter and one number'
      ),
    stringRadio: z.enum(['a', 'b', 'c']),
    stringSelect: z.enum(['a', 'b', 'c']),
    stringTextArea: z.string(),
    setListbox: z.set(z.enum(['a', 'b', 'c'])),
    setSelect: z.set(z.enum(['a', 'b', 'c'])),
    numberRecord: z.record(z.union([z.literal(1), z.literal(2), z.literal(3)])),
    recordArray: z.array(
      z.object({
        f1: z.string(),
        f2: z.string()
      })
    )
  })
});
