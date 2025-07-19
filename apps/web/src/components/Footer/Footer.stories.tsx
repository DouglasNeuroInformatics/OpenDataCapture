import type { Meta, StoryObj } from '@storybook/react-vite';

import { Footer } from './Footer';

type Story = StoryObj<typeof Footer>;

export default { component: Footer } as Meta<typeof Footer>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return <Story />;
    }
  ]
};
