import type { Meta, StoryObj } from '@storybook/react-vite';

import { withAppFrame } from '@/testing/withAppFrame';
import type { BulkParseResult } from '@/utils/bulk-assignments';

import { MapStep } from './MapStep';

type Story = StoryObj<typeof MapStep>;

const noop = () => undefined;

const idRows = [
  { first_name: 'Alice', subject_id: '9d5962039' },
  { first_name: 'Bob', subject_id: '9b310f6b7' },
  { first_name: 'Carla', subject_id: '4e8a1c2d0' }
];

const byId: BulkParseResult = {
  headers: ['subject_id', 'first_name'],
  mapping: { subject_id: 'subjectId' },
  mode: 'ID',
  preview: idRows,
  rows: idRows
};

const piiRows = [
  { dob: '1979-08-12', first: 'Alice', last: 'Martin', sex: 'FEMALE' },
  { dob: '1972-02-17', first: 'Bob', last: 'Tremblay', sex: 'MALE' }
];

const byPersonalInformation: BulkParseResult = {
  headers: ['first', 'last', 'dob', 'sex'],
  mapping: { dob: 'dateOfBirth', first: 'firstName', last: 'lastName', sex: 'sex' },
  mode: 'PII',
  preview: piiRows,
  rows: piiRows
};

const unrecognisedRows = idRows.map(({ first_name, subject_id }) => ({ given: first_name, participant: subject_id }));

export default {
  args: {
    groupName: 'Depression Clinic',
    onBack: noop,
    onResolved: noop,
    onStepChange: noop,
    parsed: byId
  },
  component: MapStep,
  decorators: [withAppFrame('Remote Assignments')],
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof MapStep>;

/** A file with an identifier column, recognised on parse. */
export const SubjectIdColumn: Story = {};

/** A file identifying subjects by name, date of birth and sex, so identifiers are derived in the browser. */
export const PersonalInformation: Story = {
  args: {
    parsed: byPersonalInformation
  }
};

/** No column was recognised, so the user has to map one before continuing. */
export const UnmappedColumns: Story = {
  args: {
    parsed: {
      ...byId,
      headers: ['participant', 'given'],
      mapping: {},
      preview: unrecognisedRows,
      rows: unrecognisedRows
    }
  }
};
