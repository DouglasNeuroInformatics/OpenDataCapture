import { JSONSchemaType } from 'ajv';
import { PropertiesSchema } from 'ajv/dist/types/json-schema';

import {
  ArrayFieldValue,
  ArrayFormField,
  BaseFormField,
  BinaryFormField,
  DateFormField,
  FormFields,
  FormFieldsGroup,
  NumericFormField,
  OptionsFormField,
  PrimitiveFieldValue,
  PrimitiveFormField,
  TextFormField
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
    min: {
      type: 'integer'
    },
    max: {
      type: 'integer'
    }
  },
  required: ['kind', 'label', 'min', 'max']
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

export const primitiveFieldSchema: JSONSchemaType<PrimitiveFormField<PrimitiveFieldValue>> = {
  oneOf: [textFieldSchema, numericFieldSchema, optionsFieldSchema, dataFieldSchema, binaryFieldSchema]
};

export const arrayFieldSchema: JSONSchemaType<ArrayFormField<ArrayFieldValue>> = {
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
};

export const formFieldsSchema: JSONSchemaType<FormFields> = {
  type: 'object',
  patternProperties: {
    '^.*$': {
      type: 'object',
      oneOf: [primitiveFieldSchema, arrayFieldSchema],
      required: []
    }
  },
  required: []
};

export const formFieldsGroupSchema: JSONSchemaType<FormFieldsGroup> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
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
};
