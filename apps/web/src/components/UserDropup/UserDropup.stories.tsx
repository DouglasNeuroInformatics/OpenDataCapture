import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { UserDropup } from './UserDropup';

type Story = StoryObj<typeof UserDropup>;

export default { component: UserDropup } as Meta<typeof UserDropup>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ],
  parameters: {
    layout: 'centered'
  }
};
