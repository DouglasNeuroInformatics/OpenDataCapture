import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

import { clickTask } from '@open-data-capture/instrument-library';

export default { component: InstrumentRenderer } as Meta<typeof InstrumentRenderer>;

export const Default: Story = {
  args: {
    bundle: clickTask.bundle
  }
};
