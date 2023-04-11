import { FormInstrument, formInstrumentSchema } from '@ddcp/common';
import Ajv from 'ajv';

type Data = {
  f1: number;
};

const myInstrument: FormInstrument = {
  kind: 'form',
  validationSchema: {
    type: 'object',
    required: []
  },
  details: {
    title: 'Instrument 1',
    description: 'Foo',
    language: 'en',
    instructions: 'Foo',
    estimatedDuration: 4
  },
  name: 'i1',
  tags: ['Good'],
  version: 1,
  content: {
    f1: {
      kind: 'numeric',
      label: 'Field 1',
      description: undefined,
      variant: 'default',
      min: 1,
      max: 2
    }
  }
};

const ajv = new Ajv();
const validate = ajv.compile(formInstrumentSchema);

const isValid = validate(myInstrument);
console.log(isValid);
