import type { Meta, StoryObj } from '@storybook/react-vite';

import { ContextMenu } from './ContextMenu';

type Story = StoryObj<typeof ContextMenu>;

export default { component: ContextMenu } as Meta<typeof ContextMenu>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ContextMenu.Trigger className="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm">
          Right click here
        </ContextMenu.Trigger>
        <ContextMenu.Content className="w-64">
          <ContextMenu.Item>Back</ContextMenu.Item>
          <ContextMenu.Item disabled>Forward</ContextMenu.Item>
          <ContextMenu.Item>Reload</ContextMenu.Item>
        </ContextMenu.Content>
      </>
    )
  }
};
