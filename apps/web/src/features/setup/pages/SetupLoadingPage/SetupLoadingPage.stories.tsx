import type { Meta, StoryObj } from '@storybook/react';

import { SetupLoadingPage } from './SetupLoadingPage';

type Story = StoryObj<typeof SetupLoadingPage>;

export default {
  component: SetupLoadingPage,
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof SetupLoadingPage>;

export const Default: Story = {};
