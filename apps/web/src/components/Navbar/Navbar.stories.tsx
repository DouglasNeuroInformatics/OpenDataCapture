import type { Meta, StoryObj } from '@storybook/react-vite';

import { Navbar } from './Navbar';

type Story = StoryObj<typeof Navbar>;

export default { component: Navbar } as Meta<typeof Navbar>;

export const Default: Story = {
  parameters: {
    layout: 'fullscreen'
  }
};
