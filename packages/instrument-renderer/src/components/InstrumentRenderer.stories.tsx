import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

import { breakoutTask, clickTask, happinessQuestionnaire, reactionTimeTask } from '@opendatacapture/instrument-library';

export default {
  component: InstrumentRenderer,
  decorators: [
    (Story) => {
      return (
        <div className="h-screen p-6">
          <Story />
        </div>
      );
    }
  ]
} as Meta<typeof InstrumentRenderer>;

export const HappinessQuestionnaire: Story = {
  args: {
    bundle: happinessQuestionnaire.bundle
  }
};

export const BreakoutTask: Story = {
  args: {
    bundle: breakoutTask.bundle
  }
};

export const ClickTask: Story = {
  args: {
    bundle: clickTask.bundle
  }
};

export const ReactionTimeTask: Story = {
  args: {
    bundle: reactionTimeTask.bundle
  }
};
