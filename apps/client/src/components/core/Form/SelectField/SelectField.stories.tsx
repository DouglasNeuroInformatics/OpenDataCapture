import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';

import { SelectField } from './SelectField';

type Story = StoryObj<typeof SelectField>;

export default {
  component: SelectField,
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
} as Meta<typeof SelectField>;

export const Default: Story = {
  args: {
    name: 'sex',
    label: 'Sex',
    options: ['Male', 'Female']
  }
};
