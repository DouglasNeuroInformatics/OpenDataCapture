import React from 'react';

import { JSONSchemaType } from 'ajv';

import { FieldKind, Form, type FormStructure } from '@/components/form';

type FormValues = {
  name: string;
  description: string;
  instructions: string;
  data: Array<{
    name: string;
    kind: FieldKind;
    label: string;
  }>;
};

const structure: FormStructure<FormValues> = [
  {
    title: 'Instrument Details',
    fields: {
      name: {
        kind: 'text',
        label: 'Instrument Name',
        variant: 'short'
      },
      description: {
        kind: 'text',
        label: 'Instrument Description',
        variant: 'long'
      },
      instructions: {
        kind: 'text',
        label: 'Instrument Instructions',
        variant: 'long'
      }
    }
  },
  {
    title: 'Instrument Fields',
    fields: {
      data: {
        kind: 'array',
        fieldset: {
          name: {
            kind: 'text',
            label: 'Field Name',
            variant: 'short'
          },
          kind: {
            kind: 'select',
            label: 'Type of Field',
            options: ['date', 'select', 'text']
          },
          label: {
            kind: 'text',
            label: 'Field Label',
            variant: 'short'
          }
        }
      }
    }
  }
];

const validationSchema: JSONSchemaType<FormValues> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1
    },
    instructions: {
      type: 'string',
      minLength: 1
    },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1
          },
          kind: {
            type: 'string',
            enum: ['date', 'select', 'text']
          },
          label: {
            type: 'string',
            minLength: 1
          }
        },
        required: ['name', 'label']
      }
    }
  },
  required: ['name', 'description', 'instructions', 'data']
};

export const FormInstrumentBuilder = () => {
  // eslint-disable-next-line no-alert
  const handleSubmit = (data: FormValues) => alert(JSON.stringify(data));
  return <Form structure={structure} validationSchema={validationSchema} onSubmit={handleSubmit} />;
};
