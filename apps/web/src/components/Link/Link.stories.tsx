import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Link } from './Link';

type Story = StoryObj<typeof Link>;

export default {
  args: {
    children: 'Hello World',
    to: '#'
  },
  component: Link,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
} as Meta<typeof Link>;

export const Default: Story = {};

export const BtnDark: Story = {
  args: {
    variant: 'btn-primary'
  }
};

export const BtnLight: Story = {
  args: {
    variant: 'btn-secondary'
  }
};
