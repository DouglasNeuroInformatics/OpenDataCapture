import type { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';

type Story = StoryObj<typeof Footer>;

export default { component: Footer } as Meta<typeof Footer>;

export const Production: Story = {
  args: {
    showDevInfo: false
  }
};

export const Development: Story = {
  args: {
    showDevInfo: true
  }
};
