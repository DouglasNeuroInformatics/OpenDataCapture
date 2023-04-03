import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default { component: Form } as Meta<typeof Form>;

type BasicFormValues = {
  textShort: string;
  textLong: string;
  textPassword: string;
  numeric: number;
  options: 'a' | 'b' | 'c';
};

export const BasicForm: StoryObj<typeof Form<BasicFormValues>> = {
  args: {
    content: {
      textShort: {
        kind: 'text',
        label: 'Short Text',
        variant: 'short'
      },
      textLong: {
        kind: 'text',
        label: 'Long Text',
        variant: 'long'
      },
      textPassword: {
        kind: 'text',
        label: 'Password',
        variant: 'password'
      },
      numeric: {
        kind: 'numeric',
        label: 'Numeric',
        min: 0,
        max: 10
      },
      options: {
        kind: 'options',
        label: 'Options',
        options: ['a', 'b', 'c']
      }
    },
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
