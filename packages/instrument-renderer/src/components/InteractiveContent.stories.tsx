import { clickTask, reactionTimeTask } from '@opendatacapture/instrument-library';
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

export const ClickTask: Story = {
  args: {
    bundle: clickTask.bundle
  }
};

export const ReactionTime: Story = {
  args: {
    bundle: reactionTimeTask.bundle
  }
};
