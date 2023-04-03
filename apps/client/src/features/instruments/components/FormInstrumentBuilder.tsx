/* eslint-disable no-alert */
import React from 'react';

import { JSONSchemaType } from 'ajv';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';

type CreateFormData = {
  name: string;
  description: string;
  instructions: string;
  /*
  data: Array<{
    name: string;
    kind: FieldKind;
    label: string;
    variant: string;
  }>; */
};

/*
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
          },
          variant: {
            kind: 'text',
            label: 'Field Variant',
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
          },
          variant: {
            type: 'string'
          }
        },
        if: {
          properties: {
            kind: {
              const: 'text'
            }
          }
        },
        then: {
          properties: {
            variant: {
              enum: ['short', 'long', 'password']
            }
          }
        },
        required: ['name', 'kind', 'label', 'variant']
      }
    }
  },
  required: ['name', 'description', 'instructions', 'data']
};

*/
export const FormInstrumentBuilder = () => {
  const { t } = useTranslation('instruments');
  return (
    <Form<CreateFormData>
      content={{
        name: {
          kind: 'text',
          label: t('createInstrument.form.name.label'),
          variant: 'short'
        },
        description: {
          kind: 'text',
          label: t('createInstrument.form.description.label'),
          variant: 'long'
        },
        instructions: {
          kind: 'text',
          label: t('createInstrument.form.instructions.label'),
          variant: 'long'
        }
      }}
      validationSchema={{
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
          }
        },
        required: ['description', 'instructions', 'name']
      }}
      onSubmit={(data) => alert(JSON.stringify(data))}
    />
  );
};
