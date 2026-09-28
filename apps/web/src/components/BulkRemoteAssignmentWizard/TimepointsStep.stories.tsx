import type { Meta, StoryObj } from '@storybook/react-vite';

import { withAppFrame } from '@/testing/withAppFrame';

import { TimepointsStep } from './TimepointsStep';

type Story = StoryObj<typeof TimepointsStep>;

const noop = () => undefined;

const inThirtyDays = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]!;

export default {
  args: {
    defaultExpiresAt: inThirtyDays,
    instruments: [
      { id: 'instrument-1', title: 'Happiness Questionnaire' },
      { id: 'instrument-2', title: 'General Consent Form' },
      { id: 'instrument-3', title: 'Enhanced Demographics Questionnaire' }
    ],
    onBack: noop,
    onChange: noop,
    onConfirm: noop,
    onStepChange: noop,
    subjectCount: 3,
    timepoints: []
  },
  component: TimepointsStep,
  decorators: [withAppFrame('Remote Assignments')],
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof TimepointsStep>;

/** Nothing added yet, so the batch cannot be reviewed. */
export const Empty: Story = {};

/** Two instruments in the batch, each with its own expiry. */
export const WithInstruments: Story = {
  args: {
    timepoints: [
      { expiresAt: inThirtyDays, instrumentId: 'instrument-1', instrumentTitle: 'Happiness Questionnaire' },
      { expiresAt: inThirtyDays, instrumentId: 'instrument-2', instrumentTitle: 'General Consent Form' }
    ]
  }
};
