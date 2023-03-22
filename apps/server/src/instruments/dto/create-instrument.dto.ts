import { JSONSchemaType } from 'ajv';

import { FormFieldVariant } from '../enums/form-field-variant.enum';
import { InstrumentKind } from '../enums/instrument-kind.enum';
import { InstrumentLanguage } from '../enums/instrument-language.enum';
import { BaseInstrument } from '../interfaces/base-instrument.interface';
import { Form, FormField } from '../schemas/form.schema';

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
      enum: Object.values(FormFieldVariant)
    },
    isRequired: {
      type: 'boolean'
    }
  },
  required: ['name', 'label', 'variant', 'isRequired']
};

const instrumentDetailsSchema: JSONSchemaType<BaseInstrument['details']> = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      minLength: 1
    },
    language: {
      type: 'string',
      enum: Object.values(InstrumentLanguage)
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
      enum: Object.values(InstrumentKind)
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
export class CreateInstrumentDto {
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
