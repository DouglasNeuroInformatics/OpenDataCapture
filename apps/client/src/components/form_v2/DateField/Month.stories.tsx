import type { Meta, StoryObj } from '@storybook/react';

import { Month } from './Month';

type Story = StoryObj<typeof Month>;

export default { component: Month } as Meta<typeof Month>;

export const Default: Story = {
  args: {
    date: new Date()
  }
};
