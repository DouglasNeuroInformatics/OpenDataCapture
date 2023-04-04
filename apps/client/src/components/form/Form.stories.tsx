import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default {
  component: Form,
  decorators: [
    (Story) => (
      <div className="container">
        <Story />
      </div>
    )
  ]
} as Meta<typeof Form>;

type BasicFormValues = {
  textShort: string;
  textLong: string;
  textPassword: string;
  numeric: number;
  options: 'a' | 'b' | 'c';
  date: string;
  binary: boolean;
  array: Array<{
    f1: string;
    f2: number;
  }>;
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
      },
      binary: {
        kind: 'binary',
        label: 'Binary'
      },
      array: {
        kind: 'array',
        label: 'Array Field',
        fieldset: {
          f1: {
            kind: 'text',
            label: 'Field 1',
            variant: 'short'
          },
          f2: {
            kind: 'numeric',
            label: 'Field 2',
            min: 0,
            max: 10
          }
        }
      }
    },
    validationSchema: {
      type: 'object',
      required: []
    },
    onSubmit: (data) => alert(JSON.stringify(data, null, 2))
  }
};
