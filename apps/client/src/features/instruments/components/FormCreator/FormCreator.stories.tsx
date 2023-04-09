import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { FormCreator } from './FormCreator';

type Story = StoryObj<typeof FormCreator>;

export default {
  component: FormCreator,
  decorators: [
    (Story) => {
      return (
        <div className="container">
          <Story />
        </div>
      );
    }
  ]
} as Meta<typeof FormCreator>;

export const Default: Story = {};
