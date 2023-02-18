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
  cart: Array<{ name: string; amount: string }>;
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
      cart: {
        kind: 'array',
        itemFields: {
          name: {
            kind: 'text',
            label: 'Name',
            variant: 'short'
          },
          amount: {
            kind: 'text',
            label: 'Amount',
            variant: 'short'
          }
        }
      }
    }
  }
];

const schema: JSONSchemaType<FormValues> = {
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
    cart: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1
          },
          amount: {
            type: 'string',
            minLength: 1
          }
        },
        required: ['name', 'amount']
      }
    }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'sex', 'dateOfBirth', 'cart']
};

export default { component: Form } as Meta<typeof Form>;

export const ExampleForm: Story = {
  args: {
    structure,
    schema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
