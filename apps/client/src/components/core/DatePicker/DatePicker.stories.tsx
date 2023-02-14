import type { Meta, StoryObj } from '@storybook/react';

import { DatePicker } from './DatePicker';

type Story = StoryObj<typeof DatePicker>;

export default { component: DatePicker } as Meta<typeof DatePicker>;

export const Default: Story = {
  args: {
    onSelection: (date) => alert(date)
  }
};
