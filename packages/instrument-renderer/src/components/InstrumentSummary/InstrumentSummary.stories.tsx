import React from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import type { Meta, StoryObj } from '@storybook/react';

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

import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualInstrument } from '@opendatacapture/schemas/instrument';

export const Clinical: Story = {
  args: {
    data: {
      favoriteNumber: 4
    },
    instrument: unilingualFormInstrument.instance as AnyUnilingualInstrument,
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
    instrument: unilingualFormInstrument.instance as AnyUnilingualInstrument,
    subject: {
      id: '123'
    },
    timeCollected: Date.now()
  }
};
