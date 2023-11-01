/* eslint-disable no-console */

import type { Meta, StoryObj } from '@storybook/react';

import { Editor } from './Editor';

type Story = StoryObj<typeof Editor>;

function sayHello() {
  console.log('hello world');
}

export default { component: Editor } satisfies Meta<typeof Editor>;

export const Default: Story = {
  args: {
    value: sayHello.toString()
  }
};
