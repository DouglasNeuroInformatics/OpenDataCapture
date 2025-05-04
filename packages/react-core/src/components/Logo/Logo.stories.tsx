import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './Logo';

type Story = StoryObj<typeof Logo>;

export default {
  component: Logo,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Logo>;

export const Default: Story = {
  args: {
    className: 'w-96'
  }
};
