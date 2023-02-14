import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

type Story = StoryObj<typeof Button>;

export default { component: Button } as Meta<typeof Button>;

export const Dark: Story = {
  args: {
    label: 'Dark Button',
    variant: 'dark'
  }
};

export const Light: Story = {
  args: {
    label: 'Light Button',
    variant: 'light'
  }
};
