import type { Meta, StoryObj } from '@storybook/react';
import { JSONSchemaType } from 'ajv';

import { Form, FormFields } from './Form';

interface LoginFormData {
  username: string;
  password: string;
}

type Story = StoryObj<typeof Form<LoginFormData>>;

const fields: FormFields<LoginFormData> = {
  username: {
    label: 'Username',
    inputType: 'text'
  },
  password: {
    label: 'Password',
    inputType: 'password'
  }
};

const schema: JSONSchemaType<LoginFormData> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: false,
  required: ['username', 'password']
};

export default { component: Form } as Meta<typeof Form>;

export const LoginForm: Story = {
  args: {
    fields,
    schema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
