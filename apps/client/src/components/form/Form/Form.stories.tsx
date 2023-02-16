import type { Meta, StoryObj } from '@storybook/react';
import { JSONSchemaType } from 'ajv';

import { GroupedFormFields } from '../types';

import { Form } from './Form';

type DemographicsFormData = {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  countryOfBirth: string;
};

type Story = StoryObj<typeof Form<DemographicsFormData>>;

const demographicsFields: GroupedFormFields<DemographicsFormData> = [
  {
    title: 'Required Fields',
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

const demographicsSchema: JSONSchemaType<DemographicsFormData> = {
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

export const DemographicsForm: Story = {
  args: {
    fields: demographicsFields,
    schema: demographicsSchema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
