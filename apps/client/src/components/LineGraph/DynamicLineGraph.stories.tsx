import type { Meta, StoryObj } from '@storybook/react';

import { DynamicLineGraph } from './DynamicLineGraph';

type Story = StoryObj<typeof DynamicLineGraph>;

export default { component: DynamicLineGraph } as Meta<typeof DynamicLineGraph>;

export const Default: Story = {
  args: {
    title: 'My Graph'
  }
};
