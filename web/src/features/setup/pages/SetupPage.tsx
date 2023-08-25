import React from 'react';

import { SetupForm } from '../components/SetupForm';

import { EntryPageWrapper } from '@/components/EntryPageWrapper';

export const SetupPage = () => {
  return (
    <EntryPageWrapper title="Setup">
      <SetupForm onSubmit={() => null} />
    </EntryPageWrapper>
  );
};
