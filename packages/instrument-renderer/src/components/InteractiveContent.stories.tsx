import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import type { Meta, StoryObj } from '@storybook/react';

import { InteractiveContent } from './InteractiveContent';

type Story = StoryObj<typeof InteractiveContent>;

export default {
  component: InteractiveContent,
  decorators: [
    (Story) => {
      return (
        <div className="h-screen p-6">
          <Story />
        </div>
      );
    }
  ]
} as Meta<typeof InteractiveContent>;

export const Default: Story = {
  args: {
    bundle: await interactiveInstrument.toBundle()
  }
};
