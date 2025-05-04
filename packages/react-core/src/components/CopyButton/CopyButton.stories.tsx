import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyButton } from './CopyButton';

type Story = StoryObj<typeof CopyButton>;

export default { component: CopyButton } as Meta<typeof CopyButton>;

export const Default: Story = {
  parameters: {
    layout: 'centered'
  }
};
