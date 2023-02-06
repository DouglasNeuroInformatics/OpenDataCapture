import type { Meta, StoryObj } from '@storybook/react';

import { DateField } from './DateField';

type Story = StoryObj<typeof DateField>;

export default { component: DateField } as Meta<typeof DateField>;

export const Default: Story = {
  args: {
    name: 'dateOfBirth'
  }
};
