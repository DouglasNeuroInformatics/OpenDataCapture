import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Dropdown } from './Dropdown';

type Story = StoryObj<typeof Dropdown>;

export default { component: Dropdown } as Meta<typeof Dropdown>;

export const Default: Story = {
  args: {
    btnLabel: 'Dropdown',
    children: [<span key={1}>Item 1</span>, <span key={2}>Item 2</span>]
  }
};
