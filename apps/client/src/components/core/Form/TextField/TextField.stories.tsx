import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';

import { TextField } from './TextField';

type Story = StoryObj<typeof TextField>;

export default {
  component: TextField,
  decorators: [
    (Story) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Story />
        </FormProvider>
      );
    }
  ]
} as Meta<typeof TextField>;

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
