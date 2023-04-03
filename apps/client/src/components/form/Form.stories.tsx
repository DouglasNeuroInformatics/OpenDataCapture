import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default { component: Form } as Meta<typeof Form>;

type BasicFormValues = {
  textShort: string;
  textLong: string;
  textPassword: string;
  numeric: number;
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
      }
    },
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
