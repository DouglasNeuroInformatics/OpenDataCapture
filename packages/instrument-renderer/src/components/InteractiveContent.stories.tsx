import { clickTask, reactionTimeTask } from '@open-data-capture/instrument-library';
import type { Meta, StoryObj } from '@storybook/react';

import { InteractiveContent } from './InteractiveContent';

type Story = StoryObj<typeof InteractiveContent>;

export default { component: InteractiveContent } as Meta<typeof InteractiveContent>;

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
