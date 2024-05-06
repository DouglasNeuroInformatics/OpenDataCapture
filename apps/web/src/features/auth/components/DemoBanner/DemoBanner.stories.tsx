import type { Meta, StoryObj } from '@storybook/react';

import { DemoBanner } from './DemoBanner';

type Story = StoryObj<typeof DemoBanner>;

export default { component: DemoBanner } as Meta<typeof DemoBanner>;

export const Default: Story = {
  args: {
    onLogin(credentials) {
      alert(JSON.stringify(credentials, null, 2));
    }
  }
};
