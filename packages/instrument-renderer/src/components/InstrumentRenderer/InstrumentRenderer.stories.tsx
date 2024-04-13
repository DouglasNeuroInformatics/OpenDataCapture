import React from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
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
        <Card className="mx-auto w-screen max-w-3xl p-6">
          <Story />
        </Card>
      );
    }
  ],
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof InstrumentRenderer>;

export const UnilingualForm: Story = {
  args: {
    bundle: unilingualFormInstrument.bundle
  }
};

export const BilingualForm: Story = {
  args: {
    bundle: bilingualFormInstrument.bundle
  }
};

export const Interactive: Story = {
  args: {
    bundle: interactiveInstrument.bundle
  }
};
