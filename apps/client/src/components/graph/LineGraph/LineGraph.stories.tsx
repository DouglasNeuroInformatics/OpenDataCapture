import type { Meta, StoryObj } from '@storybook/react';

import { LineGraph } from './LineGraph';

type Story = StoryObj<typeof LineGraph>;

export default { component: LineGraph } as Meta<typeof LineGraph>;

export const Default: Story = {
  args: {
    data: [
      {
        label: 'January',
        mean: 5,
        std: 1
      },
      {
        label: 'February',
        mean: 6,
        std: 1
      },
      {
        label: 'March',
        mean: 7,
        std: 1
      },
      {
        label: 'April',
        mean: 8,
        std: 1
      }
    ]
  }
};
