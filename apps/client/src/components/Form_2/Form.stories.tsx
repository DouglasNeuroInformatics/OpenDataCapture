import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

export default { component: Form } as Meta<typeof Form>;

type BasicFormValues = {
  firstName: string;
  lastName: string;
  scores: Array<{
    value: number;
  }>;
};

export const BasicForm: StoryObj<typeof Form<BasicFormValues>> = {
  args: {
    content: {
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
      scores: {
        kind: 'array',
        fieldset: {
          value: {
            kind: 'numeric',
            label: 'Value',
            variant: 'default'
          }
        }
      }
    }
  }
};
