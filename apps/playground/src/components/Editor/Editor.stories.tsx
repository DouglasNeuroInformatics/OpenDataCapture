import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Editor } from './Editor';

type Story = StoryObj<typeof Editor>;

export default { component: Editor } satisfies Meta<typeof Editor>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
