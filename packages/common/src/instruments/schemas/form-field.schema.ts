import { JSONSchemaType } from 'ajv';
import { PropertiesSchema } from 'ajv/dist/types/json-schema';

import { FormFieldKind } from '../enums/form-field-kind.enum';
import { StringFieldVariant } from '../enums/string-field-variant.enum';
import { BaseFormField, FormField, StringFormField } from '../interfaces/form/form-field.interface';

const baseProperties: PropertiesSchema<Omit<BaseFormField, 'kind'>> = {
  label: {
    type: 'string',
    minLength: 1
  },
  description: {
    type: 'string',
    minLength: 1,
    nullable: true
  },
  isRequired: {
    type: 'boolean',
    nullable: true
  }
};

const stringFieldSchema: JSONSchemaType<StringFormField> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      const: FormFieldKind.String
    },
    ...baseProperties,
    variant: {
      type: 'string',
      enum: Object.values(StringFieldVariant)
    }
  },
  required: ['kind', 'label', 'variant']
};

export const formFieldSchema: JSONSchemaType<FormField> = {
  oneOf: [stringFieldSchema]
};
