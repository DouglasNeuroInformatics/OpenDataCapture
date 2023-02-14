import type { Meta, StoryObj } from '@storybook/react';

import { ArrowToggle } from './ArrowToggle';

type Story = StoryObj<typeof ArrowToggle>;

export default { component: ArrowToggle } as Meta<typeof ArrowToggle>;

export const UpToDown: Story = {
  args: {
    position: 'up',
    rotation: 180
  }
};

export const LeftToDown: Story = {
  args: {
    position: 'left',
    rotation: -90
  }
};
