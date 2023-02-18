import type { Meta, StoryObj } from '@storybook/react';
import { JSONSchemaType } from 'ajv';

import { Form } from './Form';
import { FormStructure } from './types';

type FormValues = {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  countryOfBirth: string;
  arrayField: Array<{ f1: string; f2: string }>;
};

type Story = StoryObj<typeof Form<FormValues>>;

const structure: FormStructure<FormValues> = [
  {
    fields: {
      firstName: {
        kind: 'text',
        label: 'First Name',
        variant: 'short'
      },
      lastName: {
        kind: 'text',
        label: 'Last Name',
        variant: 'short'
      },
      sex: {
        kind: 'select',
        label: 'Sex',
        options: ['Male', 'Female']
      },
      dateOfBirth: {
        kind: 'date',
        label: 'Date of Birth'
      }
    }
  },
  {
    title: 'Optional Fields',
    fields: {
      countryOfBirth: {
        kind: 'text',
        label: 'Country of Birth',
        variant: 'short'
      }
    }
  },
  {
    title: 'Dynamic Fields',
    fields: {
      arrayField: {
        kind: 'array',
        itemFields: {
          f1: {
            kind: 'text',
            label: 'Field 1',
            variant: 'short'
          },
          f2: {
            kind: 'text',
            label: 'Field 2',
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
    firstName: {
      type: 'string',
      minLength: 1
    },
    lastName: {
      type: 'string',
      minLength: 1
    },
    sex: {
      type: 'string',
      enum: ['Male', 'Female']
    },
    dateOfBirth: {
      type: 'string',
      format: 'date'
    },
    countryOfBirth: {
      type: 'string'
    },
    arrayField: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          f1: {
            type: 'string',
            minLength: 1
          },
          f2: {
            type: 'string',
            minLength: 1
          }
        },
        required: ['f1', 'f2']
      }
    }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'sex', 'dateOfBirth', 'arrayField']
};

export default { component: Form } as Meta<typeof Form>;

export const ExampleForm: Story = {
  args: {
    structure,
    validationSchema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
