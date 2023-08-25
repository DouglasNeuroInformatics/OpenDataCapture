import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { EntryPageWrapper } from './EntryPageWrapper';

type Story = StoryObj<typeof EntryPageWrapper>;

export default {
  component: EntryPageWrapper,
  args: {
    title: 'Example',
    children: (
      <div className="border">
        <p className="text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi voluptatibus harum et, facilis aut
          distinctio, porro pariatur aperiam consectetur veritatis ad itaque doloremque ex corporis reiciendis non quod
          esse cum.
        </p>
      </div>
    )
  }
} as Meta<typeof EntryPageWrapper>;

export const Default: Story = {};
