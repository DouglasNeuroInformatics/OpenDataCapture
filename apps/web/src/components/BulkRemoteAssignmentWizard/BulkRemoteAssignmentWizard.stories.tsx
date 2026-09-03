import React from 'react';

import type { Subject } from '@opendatacapture/schemas/subject';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { BulkRemoteAssignmentWizard } from './BulkRemoteAssignmentWizard';

type Story = StoryObj<typeof BulkRemoteAssignmentWizard>;

const subject = (id: string): Subject => ({
  createdAt: new Date(),
  dateOfBirth: null,
  firstName: null,
  groupIds: ['group-1'],
  id,
  lastName: null,
  sex: null,
  updatedAt: new Date()
});

export default {
  args: {
    defaultExpiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]!,
    groupId: 'group-1',
    instruments: [
      { id: 'instrument-1', title: 'Happiness Questionnaire' },
      { id: 'instrument-2', title: 'General Consent Form' }
    ],
    subjectIdDisplayLength: 9,
    subjects: [subject('Depression_Clinic$001'), subject('Depression_Clinic$002')]
  },
  component: BulkRemoteAssignmentWizard,
  // The wizard submits through a mutation, so it needs a client even in the states that never submit.
  decorators: [
    (Story: React.ComponentType) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    )
  ]
} as Meta<typeof BulkRemoteAssignmentWizard>;

/** The entry state: pick existing subjects, upload a file, or paste delimited data. */
export const Source: Story = {};

/** Subjects identified by a hash, which the picker still lists and truncates for display. */
export const HashIdentifiedSubjects: Story = {
  args: {
    subjects: [subject('a'.repeat(64)), subject('b'.repeat(64))]
  }
};

/** The group has opted into no instruments, so no timepoint can be added. */
export const NoAccessibleInstruments: Story = {
  args: {
    instruments: []
  }
};
