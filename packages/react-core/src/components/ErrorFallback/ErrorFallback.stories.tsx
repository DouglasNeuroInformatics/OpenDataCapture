import type { Meta, StoryObj } from '@storybook/react';

import { ErrorFallback } from './ErrorFallback';

type Story = StoryObj<typeof ErrorFallback>;

export default { component: ErrorFallback } as Meta<typeof ErrorFallback>;

export const Default: Story = {
  args: {
    description: 'Description',
    subtitle: 'Subtitle',
    title: 'Title'
  },
  parameters: {
    layout: 'centered'
  }
};
