import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { FieldsForm } from './FieldsForm';

import { StepperContext } from '@/context/StepperContext';

type Story = StoryObj<typeof FieldsForm>;

export default {
  decorators: [
    (Story) => (
      <StepperContext.Provider value={{ index: 0, updateIndex: () => undefined }}>
        <Story />
      </StepperContext.Provider>
    )
  ],
  component: FieldsForm
} as Meta<typeof FieldsForm>;

export const Default: Story = {};
