import React from 'react';

import { Heading, Spinner } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';

import { ManageGroupForm } from '../components/ManageGroupForm';
import { useUpdateGroup } from '../hooks/useUpdateGroup';

export const ManageGroupPage = () => {
  const { t } = useTranslation('group');
  const summariesQuery = useInstrumentSummariesQuery();
  const updateGroupMutation = useUpdateGroup();

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('manage.pageTitle')}
        </Heading>
      </PageHeader>
      {summariesQuery.data ? (
        <ManageGroupForm availableInstruments={summariesQuery.data} onSubmit={updateGroupMutation.mutateAsync} />
      ) : (
        <div className="flex-grow">
          <Spinner />
        </div>
      )}
    </React.Fragment>
  );
};
