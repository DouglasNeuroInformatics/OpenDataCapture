import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

import { clickTask, happinessQuestionnaire } from '@open-data-capture/instrument-library';

export default { component: InstrumentRenderer } as Meta<typeof InstrumentRenderer>;

export const HappinessQuestionnaire: Story = {
  args: {
    bundle: happinessQuestionnaire.bundle
  }
};

export const ClickTask: Story = {
  args: {
    bundle: clickTask.bundle
  }
};
