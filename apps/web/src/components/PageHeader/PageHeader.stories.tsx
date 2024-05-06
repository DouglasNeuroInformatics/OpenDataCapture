import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import type { Meta, StoryObj } from '@storybook/react';

import { PageHeader } from './PageHeader';
type Story = StoryObj<typeof PageHeader>;

export default { component: PageHeader } as Meta<typeof PageHeader>;

export const Default: Story = {
  args: {
    children: <Heading variant="h2">Heading</Heading>
  }
};
