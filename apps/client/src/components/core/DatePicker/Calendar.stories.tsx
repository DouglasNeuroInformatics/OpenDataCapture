import type { Meta, StoryObj } from '@storybook/react';

import { Calendar } from './Calendar';

const today = new Date();

type Story = StoryObj<typeof Calendar>;

export default { component: Calendar } as Meta<typeof Calendar>;

export const Default: Story = {
  args: {
    month: today.getMonth(),
    year: today.getFullYear(),
    onSelection: (date) => alert(date)
  }
};
