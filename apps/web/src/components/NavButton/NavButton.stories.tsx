import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeIcon } from 'lucide-react';

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
        <div className="h-screen bg-slate-900 p-6">
          <Story />
        </div>
      );
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
