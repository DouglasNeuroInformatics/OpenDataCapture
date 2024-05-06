import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Navbar } from './Navbar';

type Story = StoryObj<typeof Navbar>;

export default { component: Navbar } as Meta<typeof Navbar>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
