import type { Meta, StoryObj } from '@storybook/react';

import { SetupPage } from './SetupPage';

type Story = StoryObj<typeof SetupPage>;

export default {
  component: SetupPage,
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof SetupPage>;

export const Default: Story = {};
