import type { Meta, StoryObj } from '@storybook/react';

import { MobileBlocker } from './MobileBlocker';

type Story = StoryObj<typeof MobileBlocker>;

export default { component: MobileBlocker } satisfies Meta<typeof MobileBlocker>;

export const Default: Story = {
  args: {
    children: <p>This should only show on desktop!</p>
  }
};
