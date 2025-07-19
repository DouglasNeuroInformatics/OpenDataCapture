import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAppStore } from '@/store';
import { currentSession, currentUser } from '@/testing/stubs';

import { Sidebar } from './Sidebar';

type Story = StoryObj<typeof Sidebar>;

useAppStore.setState({
  currentSession,
  currentUser
});

export default { component: Sidebar } as Meta<typeof Sidebar>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return <Story />;
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
