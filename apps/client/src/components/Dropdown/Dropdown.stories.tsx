import type { Meta, StoryObj } from '@storybook/react';

import { Dropdown } from './Dropdown';

type Story = StoryObj<typeof Dropdown>;

export default { component: Dropdown } as Meta<typeof Dropdown>;

export const Default: Story = {
  args: {
    title: 'Dropdown',
    options: ['Option 1', 'Option 2']
  }
};
