import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';

import { InputGroup } from './InputGroup';

type Story = StoryObj<typeof InputGroup>;

export default {
  component: InputGroup,
  decorators: [
    (Story) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Story />;
        </FormProvider>
      );
    }
  ]
} as Meta<typeof InputGroup>;

export const Text: Story = {
  args: {
    name: 'text',
    label: 'Text',
    type: 'text'
  }
};

export const Password: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password'
  }
};
