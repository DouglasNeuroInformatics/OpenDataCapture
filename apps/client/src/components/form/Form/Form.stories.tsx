import type { Meta, StoryObj } from '@storybook/react';
import { JSONSchemaType } from 'ajv';

import { FormFields } from '../types';

import { Form } from './Form';

type FormValues = {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  countryOfBirth: string;
};

type Story = StoryObj<typeof Form<FormValues>>;

const fields: FormFields<FormValues> = [
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
    }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'sex', 'dateOfBirth']
};

export default { component: Form } as Meta<typeof Form>;

export const ExampleForm: Story = {
  args: {
    fields,
    schema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
