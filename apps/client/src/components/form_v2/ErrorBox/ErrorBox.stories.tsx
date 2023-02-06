import type { Meta, StoryObj } from '@storybook/react';

import { ErrorBox } from './ErrorBox';

type Story = StoryObj<typeof ErrorBox>;

export default { component: ErrorBox } as Meta<typeof ErrorBox>;

export const Default: Story = {
  args: {
    message: 'An unknown error occurred'
  }
};
