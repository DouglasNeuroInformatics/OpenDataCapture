import type { Meta, StoryObj } from '@storybook/react-vite';

import { UserDropup } from './UserDropup';

type Story = StoryObj<typeof UserDropup>;

export default { component: UserDropup } as Meta<typeof UserDropup>;

export const Default: Story = {
  decorators: [(Story) => <Story />],
  parameters: {
    layout: 'centered'
  }
};
