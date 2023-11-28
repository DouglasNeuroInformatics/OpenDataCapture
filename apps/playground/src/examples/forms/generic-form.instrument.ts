/* eslint-disable perfectionist/sort-object-types */
/* eslint-disable perfectionist/sort-objects */

type GenericFormInstrumentData = {
  binaryCheck: boolean;
  binaryRadio: boolean;
  date: Date;
  numericDefault: number;
  numericSlider: number;
  optionsField: 'a' | 'b' | 'c';
  textLong: string;
  textPassword: string;
  textShort: string;
  arrayField: {
    name: string;
  }[];
};

type GenericFormInstrument = StrictFormInstrument<GenericFormInstrumentData, 'en'>;

const genericFormInstrument: GenericFormInstrument = {
  kind: 'form',
  language: 'en',
  name: 'GenericInstrument',
  tags: ['Example'],
  version: 1.0,
  content: {
    binaryCheck: {
      kind: 'binary',
      label: 'Checkbox',
      variant: 'checkbox'
    },
    binaryRadio: {
      kind: 'binary',
      label: 'Radio',
      variant: 'radio'
    },
    date: {
      kind: 'date',
      label: 'Date'
    },
    numericDefault: {
      kind: 'numeric',
      label: 'Numeric (Default)',
      variant: 'default'
    },
    numericSlider: {
      kind: 'numeric',
      label: 'Numeric (Slider)',
      variant: 'slider',
      min: 0,
      max: 10
    },
    optionsField: {
      kind: 'options',
      label: 'Options',
      options: {
        a: 'Option A',
        b: 'Option B',
        c: 'Option C'
      }
    },
    textLong: {
      kind: 'text',
      label: 'Long Text',
      variant: 'long'
    },
    textShort: {
      kind: 'text',
      label: 'Short Text',
      variant: 'short'
    },
    textPassword: {
      kind: 'text',
      label: 'Password',
      variant: 'password'
    },
    arrayField: {
      kind: 'array',
      label: 'Array Field',
      fieldset: {
        name: {
          kind: 'text',
          label: 'Name',
          variant: 'short'
        }
      }
    }
  },
  details: {
    description: 'This example includes a variety of possible field types',
    title: 'Generic Instrument',
    estimatedDuration: 5,
    instructions: 'Please complete all questions'
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
};

export default genericFormInstrument;
