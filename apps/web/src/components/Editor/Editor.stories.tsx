/* eslint-disable no-console */

import type { Meta, StoryObj } from '@storybook/react';

import { Editor } from './Editor';

type Story = StoryObj<typeof Editor>;

export default { component: Editor } satisfies Meta<typeof Editor>;

export const Default: Story = {
  args: {
    files: [
      {
        content: "export const sayHello = () => console.log('hello world')",
        filename: 'hello.ts'
      },
      {
        content: "export * from './hello'",
        filename: 'index.ts'
      }
    ]
  }
};
