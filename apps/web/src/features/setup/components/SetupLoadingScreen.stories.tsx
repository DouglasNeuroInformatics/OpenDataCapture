import type { Meta, StoryObj } from '@storybook/react';

import { SetupLoadingScreen } from './SetupLoadingScreen';

type Story = StoryObj<typeof SetupLoadingScreen>;

export default {
  component: SetupLoadingScreen,
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof SetupLoadingScreen>;

export const Default: Story = {};
