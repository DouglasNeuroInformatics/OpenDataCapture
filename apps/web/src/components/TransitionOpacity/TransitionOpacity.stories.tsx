import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { TransitionOpacity } from './TransitionOpacity';

type Story = StoryObj<typeof TransitionOpacity>;

export default { component: TransitionOpacity } as Meta<typeof TransitionOpacity>;

export const Default: Story = {
  args: {
    children: <h1>Hello World</h1>,
    show: true
  }
};
