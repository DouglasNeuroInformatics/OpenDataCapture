import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Editor } from '../Editor';

type Story = StoryObj<typeof Editor>;

export default { component: Editor } satisfies Meta<typeof Editor>;

export const Default: Story = {
  args: {
    className: 'h-full'
  },
  decorators: [
    (Story) => (
      <div className="h-screen p-8">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
