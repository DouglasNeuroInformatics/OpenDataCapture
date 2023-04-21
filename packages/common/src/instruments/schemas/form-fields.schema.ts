import { JSONSchemaType } from 'ajv';
import { PropertiesSchema } from 'ajv/dist/types/json-schema';

import {
  ArrayFormField,
  BaseFormField,
  BinaryFormField,
  DateFormField,
  FormFields,
  FormFieldsGroup,
  NumericFormField,
  OptionsFormField,
  PrimitiveFormField,
  TextFormField
} from '../interfaces/form/form-fields.types';

const baseProperties = {
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
} satisfies PropertiesSchema<Omit<BaseFormField, 'kind'>>;

export const textFieldSchema = {
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
} satisfies JSONSchemaType<TextFormField>;

export const numericFieldSchema = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'numeric'
    },
    min: {
      type: 'integer'
    },
    max: {
      type: 'integer'
    },
    variant: {
      type: 'string',
      enum: ['default', 'slider']
    }
  },
  required: ['kind', 'label', 'min', 'max', 'variant']
} satisfies JSONSchemaType<NumericFormField>;

export const optionsFieldSchema = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'options'
    },
    options: {
      type: 'object',
      patternProperties: {
        '^.*$': {
          type: 'string'
        }
      },
      required: []
    }
  },
  required: ['kind', 'label', 'options']
} satisfies JSONSchemaType<OptionsFormField>;

export const dataFieldSchema = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'date'
    }
  },
  required: ['kind', 'label']
} satisfies JSONSchemaType<DateFormField>;

export const binaryFieldSchema = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'binary'
    },
    variant: {
      type: 'string',
      const: 'checkbox'
    }
  },
  required: ['kind', 'label', 'variant']
} satisfies JSONSchemaType<BinaryFormField>;

export const primitiveFieldSchema = {
  oneOf: [textFieldSchema, numericFieldSchema, optionsFieldSchema, dataFieldSchema, binaryFieldSchema]
} satisfies JSONSchemaType<PrimitiveFormField>;

export const arrayFieldSchema = {
  type: 'object',
  properties: {
    ...baseProperties,
    kind: {
      type: 'string',
      const: 'array'
    },
    fieldset: {
      type: 'object',
      patternProperties: {
        '^.*$': primitiveFieldSchema
      },
      minProperties: 1,
      required: []
    }
  },
  required: ['kind', 'fieldset']
} satisfies JSONSchemaType<ArrayFormField>;

export const formFieldsSchema = {
  type: 'object',
  patternProperties: {
    '^.*$': {
      type: 'object',
      oneOf: [primitiveFieldSchema, arrayFieldSchema],
      required: []
    }
  },
  required: []
} satisfies JSONSchemaType<FormFields>;

export const formFieldsGroupSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      maxLength: 1,
      nullable: true
    },
    fields: {
      type: 'object',
      patternProperties: {
        '^.*$': {
          type: 'object',
          oneOf: [primitiveFieldSchema, arrayFieldSchema],
          required: []
        }
      },
      required: []
    }
  },
  required: ['fields']
} satisfies JSONSchemaType<FormFieldsGroup>;
