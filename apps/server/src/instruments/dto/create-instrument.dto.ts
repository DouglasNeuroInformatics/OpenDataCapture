import {
  FormFieldVariant,
  InstrumentDetails as InstrumentDetailsInterface,
  Instrument as InstrumentInterface,
  InstrumentKind,
  InstrumentLanguage
} from '@ddcp/common/types';
import { JSONSchemaType } from 'ajv';

import { Form, FormField } from '../entities/form.entity';

import { Dto } from '@/core/decorators/dto.decorator';

const formFieldSchema: JSONSchemaType<FormField> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    label: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1,
      nullable: true
    },
    variant: {
      type: 'string',
      enum: ['TEXT'] satisfies FormFieldVariant[]
    },
    isRequired: {
      type: 'boolean'
    }
  },
  required: ['name', 'label', 'variant', 'isRequired']
};

const instrumentDetailsSchema: JSONSchemaType<InstrumentDetailsInterface> = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      minLength: 1
    },
    language: {
      type: 'string',
      enum: ['EN', 'FR'] satisfies InstrumentLanguage[]
    },
    instructions: {
      type: 'string',
      minLength: 1
    },
    estimatedDuration: {
      type: 'integer'
    },
    version: {
      type: 'number'
    }
  },
  required: ['estimatedDuration', 'instructions', 'language', 'version']
};

export const instrumentSchema: JSONSchemaType<Form> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['FORM'] satisfies InstrumentKind[]
    },
    title: {
      type: 'string',
      minLength: 1
    },
    details: instrumentDetailsSchema,
    data: {
      type: 'array',
      items: formFieldSchema
    }
  },
  required: ['kind', 'title', 'details', 'data']
};

@Dto<Form>(instrumentSchema)
export class CreateInstrumentDto implements InstrumentInterface {
  kind: InstrumentKind;
  title: string;
  details: {
    description: string;
    language: InstrumentLanguage;
    instructions: string;
    estimatedDuration: number;
    version: number;
  };
  data: any;
}
