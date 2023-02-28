import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

type FormValues = {
  shortText: string;
  longText: string;
  passwordText: string;
  range: number;
};

export default { component: Form } as Meta<typeof Form>;

export const DemoForm: StoryObj<typeof Form<FormValues>> = {
  args: {
    structure: [
      {
        title: 'Text Fields',
        fields: {
          shortText: {
            kind: 'text',
            label: 'Short Text Field',
            variant: 'short'
          },
          longText: {
            kind: 'text',
            label: 'Long Text Field',
            variant: 'long'
          },
          passwordText: {
            kind: 'text',
            label: 'Password Text Field',
            variant: 'password'
          }
        }
      },
      {
        title: 'Numeric Fields',
        fields: {}
      }
    ],
    validationSchema: {
      type: 'object',
      properties: {
        shortText: {
          type: 'string',
          minLength: 1
        },
        longText: {
          type: 'string',
          minLength: 1
        },
        passwordText: {
          type: 'string',
          minLength: 1
        },
        range: {
          type: 'integer'
        }
      },
      required: ['shortText', 'longText']
    },
    onSubmit: (values) => alert(JSON.stringify(values))
  }
};
