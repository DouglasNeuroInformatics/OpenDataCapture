import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { LoadingFallback } from './LoadingFallback';

type Story = StoryObj<typeof LoadingFallback>;

export default { component: LoadingFallback } as Meta<typeof LoadingFallback>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <div className="h-screen w-screen">
          <Story />
        </div>
      );
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
