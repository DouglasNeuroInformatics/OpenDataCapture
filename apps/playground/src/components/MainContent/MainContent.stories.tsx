import type { Meta, StoryObj } from '@storybook/react-vite';

import { MainContent } from './MainContent';

type Story = StoryObj<typeof MainContent>;

export default { component: MainContent } as Meta<typeof MainContent>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <div className="flex h-screen flex-col p-8">
          <Story />
        </div>
      );
    }
  ],
  parameters: {
    layout: 'fullscreen'
  }
};
