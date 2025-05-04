import { Card } from '@douglasneuroinformatics/libui/components';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualScalarInstrument } from '@opendatacapture/runtime-core';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { InstrumentSummary } from './InstrumentSummary';

type Story = StoryObj<typeof InstrumentSummary>;

export default {
  component: InstrumentSummary,
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
} as Meta<typeof InstrumentSummary>;

export const Clinical: Story = {
  args: {
    data: {
      favoriteNumber: 4
    },
    instrument: unilingualFormInstrument.instance as AnyUnilingualScalarInstrument,
    subject: {
      dateOfBirth: new Date(2000),
      firstName: 'Jane',
      id: '123',
      lastName: 'Doe',
      sex: 'FEMALE'
    },
    timeCollected: Date.now()
  }
};

export const Research: Story = {
  args: {
    data: {
      favoriteNumber: 4
    },
    instrument: unilingualFormInstrument.instance as AnyUnilingualScalarInstrument,
    subject: {
      id: '123'
    },
    timeCollected: Date.now()
  }
};
