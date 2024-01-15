import type { Meta, StoryObj } from '@storybook/react';

import { EditorPane } from './EditorPane';

type Story = StoryObj<typeof EditorPane>;

export default { component: EditorPane } satisfies Meta<typeof EditorPane>;

export const Default: Story = {
  args: {
    defaultValue: "console.log('hello world')",
    path: 'index.ts'
  }
};
