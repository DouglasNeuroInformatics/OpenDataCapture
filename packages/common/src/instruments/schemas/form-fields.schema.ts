import { JSONSchemaType } from 'ajv';
import { PropertiesSchema, SomeJSONSchema } from 'ajv/dist/types/json-schema';

import {
  BaseFormField,
  BinaryFormField,
  ComplexFormField,
  DateFormField,
  FormFieldValue,
  NumericFormField,
  OptionsFormField,
  PrimitiveFormField,
  TextFormField,
  UngroupedFormFields
} from '../interfaces/form/form-fields.interface';

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

export const textFieldSchema: JSONSchemaType<TextFormField> = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'text'
    },
    variant: {
      type: 'string',
      enum: ['short', 'long', 'password']
    }
  },
  required: ['kind', 'label', 'variant']
};

export const numericFieldSchema: JSONSchemaType<NumericFormField> = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'numeric'
    },
    variant: {
      type: 'string',
      enum: ['default', 'slider']
    }
  },
  required: ['kind', 'label', 'variant']
};

export const optionsFieldSchema: JSONSchemaType<OptionsFormField> = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'options'
    },
    options: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      uniqueItems: true
    }
  },
  required: ['kind', 'label', 'options']
};

export const dataFieldSchema: JSONSchemaType<DateFormField> = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'date'
    }
  },
  required: ['kind', 'label']
};

export const binaryFieldSchema: JSONSchemaType<BinaryFormField> = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'binary'
    }
  },
  required: ['kind', 'label']
};

export const primitiveFieldSchema: JSONSchemaType<
  PrimitiveFormField<string> | PrimitiveFormField<number> | PrimitiveFormField<boolean>
> = {
  oneOf: [textFieldSchema, numericFieldSchema, optionsFieldSchema, dataFieldSchema, binaryFieldSchema]
};

export const complexFieldSchema: JSONSchemaType<
  | ComplexFormField<Record<string, string>>
  | ComplexFormField<Record<string, number>>
  | ComplexFormField<Record<string, boolean>>
> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      const: 'complex'
    },
    fieldset: {
      additionalProperties: {
        oneOf: [dataFieldSchema]
      }
    }
  },
  required: ['kind', 'fieldset']
};

export const formFieldSchema: JSONSchemaType<FormField<FormFieldValue | Record<string, FormFieldValue>>> = {
  type: 'object',
  oneOf: [primitiveFieldSchema, complexFieldSchema]
};

export const ungroupedFieldsSchema: JSONSchemaType<UngroupedFormFields<any>> = {
  type: 'object',
  additionalProperties: formFieldSchema
};

/*
export const formFieldsSchema: JSONSchemaType<FormFields> = {
  oneOf: [
    {
      type: 'object',
      additionalProperties: formFieldSchema
    },
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            nullable: true
          },
          fields: {
            type: 'object',
            patternProperties: {
              '^S+$': formFieldSchema
            }
          }
        }
      }
    }
  ]
};
*/
