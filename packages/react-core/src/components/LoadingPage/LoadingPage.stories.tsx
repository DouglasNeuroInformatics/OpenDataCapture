import type { Meta, StoryObj } from '@storybook/react';

import { LoadingPage } from './LoadingPage';

type Story = StoryObj<typeof LoadingPage>;

export default {
  component: LoadingPage,
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof LoadingPage>;

export const Default: Story = {};
