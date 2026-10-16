import type { Meta, StoryObj } from '@storybook/react-vite';

import { Resizable } from './Resizable';

type Story = StoryObj<typeof Resizable.PanelGroup>;

export default { component: Resizable.PanelGroup } as Meta<typeof Resizable.PanelGroup>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Resizable.Panel defaultSize={50}>
          <div className="flex h-50 items-center justify-center p-6">
            <span className="font-semibold">One</span>
          </div>
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel defaultSize={50}>
          <Resizable.PanelGroup direction="vertical">
            <Resizable.Panel defaultSize={25}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Two</span>
              </div>
            </Resizable.Panel>
            <Resizable.Handle />
            <Resizable.Panel defaultSize={75}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Three</span>
              </div>
            </Resizable.Panel>
          </Resizable.PanelGroup>
        </Resizable.Panel>
      </>
    ),
    className: 'max-w-md rounded-lg border',
    direction: 'horizontal'
  }
};
