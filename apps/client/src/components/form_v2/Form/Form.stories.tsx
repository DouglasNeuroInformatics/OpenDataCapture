import type { Meta, StoryObj } from '@storybook/react';

import { Form, FormSchemaType } from './Form';

interface LoginFormData {
  username: string;
  password: string;
}

type Story = StoryObj<typeof Form<LoginFormData>>;

const schema: FormSchemaType<LoginFormData> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string'
    }
  },
  additionalProperties: false,
  required: ['username', 'password']
};

export default { component: Form } as Meta<typeof Form>;

export const LoginForm: Story = {
  args: {
    schema: schema,
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
