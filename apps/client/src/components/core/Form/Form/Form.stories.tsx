import type { Meta, StoryObj } from '@storybook/react';
import { JSONSchemaType } from 'ajv';

import { Form, FormFields } from './Form';

interface DemographicsFormData {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
}

type Story = StoryObj<typeof Form<DemographicsFormData>>;

const fields: FormFields<DemographicsFormData> = {
  firstName: {
    label: 'First Name',
    fieldType: 'text'
  },
  lastName: {
    label: 'Last Name',
    fieldType: 'text'
  },
  sex: {
    label: 'Sex',
    fieldType: 'text'
  }
};

const schema: JSONSchemaType<DemographicsFormData> = {
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
    }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'sex']
};

export default { component: Form } as Meta<typeof Form>;

export const LoginForm: Story = {
  args: {
    fields,
    schema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
