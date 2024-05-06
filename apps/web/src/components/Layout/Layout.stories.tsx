import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { useAppStore } from '@/store';
import { currentSession, currentUser } from '@/testing/server/stubs';

import { Layout } from './Layout';
type Story = StoryObj<typeof Layout>;

useAppStore.setState({
  currentSession,
  currentUser
});

export default { component: Layout } as Meta<typeof Layout>;

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
