import type { Meta, StoryObj } from '@storybook/react';

import { StartSessionForm } from './StartSessionForm';

type Story = StoryObj<typeof StartSessionForm>;

export default { component: StartSessionForm } as Meta<typeof StartSessionForm>;

export const Default: Story = {
  args: {
    onSubmit(data) {
      alert(JSON.stringify(data, null, 2));
    }
  }
};
