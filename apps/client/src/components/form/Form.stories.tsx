import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default { component: Form } as Meta<typeof Form>;

type BasicFormValues = {
  textShort: string;
  textLong: string;
  textPassword: string;
  numeric: number;
  options: 'a' | 'b' | 'c';
  date: string;
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
        description: 'This is a numeric field',
        kind: 'numeric',
        label: 'Numeric',
        min: 0,
        max: 10
      },
      options: {
        kind: 'options',
        label: 'Options',
        options: {
          a: 'Option A',
          b: 'Option B',
          c: 'Option C'
        }
      },
      date: {
        kind: 'date',
        label: 'Date'
      }
    },
    onSubmit: (data) => alert(JSON.stringify(data))
  }
};
