import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { useAppStore } from '@/store';
import { currentSession, currentUser } from '@/testing/server/stubs';

import { Sidebar } from './Sidebar';

type Story = StoryObj<typeof Sidebar>;

export default { component: Sidebar } as Meta<typeof Sidebar>;

useAppStore.setState({
  currentSession,
  currentUser
});

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
