import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Footer } from './Footer';

type Story = StoryObj<typeof Footer>;

export default { component: Footer } as Meta<typeof Footer>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    }
  ]
};
