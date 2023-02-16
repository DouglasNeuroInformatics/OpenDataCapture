import type { Meta, StoryObj } from '@storybook/react';
import { JSONSchemaType } from 'ajv';

import { FormDataType, FormFields } from '../types';

import { Form } from './Form';

interface DemographicsFormData extends FormDataType {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
}

type Story = StoryObj<typeof Form<DemographicsFormData>>;

const demographicsFields: FormFields<DemographicsFormData> = {
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
};

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
