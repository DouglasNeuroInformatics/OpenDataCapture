import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { HomeIcon } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

import { NavButton } from './NavButton';

type Story = StoryObj<typeof NavButton>;

export default { component: NavButton } as Meta<typeof NavButton>;

export const Default: Story = {
  args: {
    icon: HomeIcon,
    label: 'Home'
  },
  decorators: [
    (Story) => {
      return (
        <MemoryRouter>
          <div className="h-screen bg-slate-900 p-6">
            <Story />
          </div>
        </MemoryRouter>
      );
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
