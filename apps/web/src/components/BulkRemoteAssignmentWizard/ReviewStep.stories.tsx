import type { Meta, StoryObj } from '@storybook/react-vite';

import { withAppFrame } from '@/testing/withAppFrame';

import { ReviewStep } from './ReviewStep';

type Story = StoryObj<typeof ReviewStep>;

const noop = () => undefined;

const inThirtyDays = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]!;

export default {
  args: {
    describeSubject: (subjectId: string) => subjectId,
    failure: null,
    isSubmitting: false,
    onBack: noop,
    onStepChange: noop,
    onSubmit: noop,
    subjectCount: 3,
    timepoints: [
      { expiresAt: inThirtyDays, instrumentId: 'instrument-1', instrumentTitle: 'Happiness Questionnaire' },
      { expiresAt: inThirtyDays, instrumentId: 'instrument-2', instrumentTitle: 'General Consent Form' }
    ],
    transportError: false
  },
  component: ReviewStep,
  decorators: [withAppFrame('Remote Assignments')],
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof ReviewStep>;

/** The preflight passed, so the batch can be created. */
export const Ready: Story = {};

/** Some subjects already hold an assignment for one of the instruments; the user may waive it. */
export const Conflict: Story = {
  args: {
    failure: {
      code: 'BULK_ASSIGNMENT_REFUSED',
      issues: [
        {
          conflicts: [
            { instrumentId: 'instrument-1', subjectId: '9d5962039' },
            { instrumentId: 'instrument-1', subjectId: '9b310f6b7' }
          ],
          kind: 'CONFLICT'
        }
      ]
    }
  }
};

/** The request never completed, so nothing was created and the user can try again. */
export const TransportError: Story = {
  args: {
    transportError: true
  }
};
