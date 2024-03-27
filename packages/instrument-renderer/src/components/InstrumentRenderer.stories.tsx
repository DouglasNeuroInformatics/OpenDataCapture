import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

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

export const UnilingualForm: Story = {
  args: {
    bundle: await unilingualFormInstrument.toBundle()
  }
};

export const BilingualForm: Story = {
  args: {
    bundle: await bilingualFormInstrument.toBundle()
  }
};

export const Interactive: Story = {
  args: {
    bundle: await interactiveInstrument.toBundle()
  }
};
