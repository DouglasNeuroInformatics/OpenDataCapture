import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';

import { DateField } from './DateField';

type Story = StoryObj<typeof DateField>;

export default {
  component: DateField,
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
} as Meta<typeof DateField>;

export const Default: Story = {
  args: {
    name: 'dateOfBirth',
    label: 'Date of Birth'
  }
};
