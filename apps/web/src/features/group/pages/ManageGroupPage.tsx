import React from 'react';

import { Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';
import { useAppStore } from '@/store';

import { ManageGroupForm } from '../components/ManageGroupForm';
import { useUpdateGroup } from '../hooks/useUpdateGroup';

export const ManageGroupPage = () => {
  const { t } = useTranslation('group');
  const summariesQuery = useInstrumentSummariesQuery();
  const updateGroupMutation = useUpdateGroup();
  const changeGroup = useAppStore((store) => store.changeGroup);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('manage.pageTitle')}
        </Heading>
      </PageHeader>
      {summariesQuery.data ? (
        <ManageGroupForm
          availableInstruments={summariesQuery.data}
          onSubmit={async (data) => {
            const updatedGroup = await updateGroupMutation.mutateAsync(data);
            changeGroup(updatedGroup);
          }}
        />
      ) : (
        <div className="flex-grow">
          <Spinner />
        </div>
      )}
    </React.Fragment>
  );
};
