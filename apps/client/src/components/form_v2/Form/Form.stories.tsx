import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';
import { FormSchemaType } from './types';

interface LoginFormData {
  username: string;
  password: string;
}

type Story = StoryObj<typeof Form<LoginFormData>>;

const schema: FormSchemaType<LoginFormData> = {
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  },
  additionalProperties: false,
  required: ['username', 'password']
};

export default { component: Form } as Meta<typeof Form>;

schema.properties?.password;
export const LoginForm: Story = {
  args: {
    schema: schema
  }
};
