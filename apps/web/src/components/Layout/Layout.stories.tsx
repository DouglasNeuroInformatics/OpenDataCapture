import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAppStore } from '@/store';
import { currentSession, currentUser } from '@/testing/stubs';

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
      return <Story />;
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
