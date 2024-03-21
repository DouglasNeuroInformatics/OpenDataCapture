import React from 'react';

import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { useActiveVisitStore } from '@/stores/active-visit-store';
import { useAuthStore } from '@/stores/auth-store';

import { AddVisitForm, type AddVisitFormData } from '../components/AddVisitForm';
import { useCreateVisit } from '../hooks/useCreateVisit';

export const AddVisitPage = () => {
  const { setActiveVisit } = useActiveVisitStore();
  const { currentGroup } = useAuthStore();
  const { t } = useTranslation('visits');
  const createVisitMutation = useCreateVisit();

  const handleSubmit = async ({ date, ...subjectIdData }: AddVisitFormData) => {
    const visit = await createVisitMutation.mutateAsync({
      date,
      groupId: currentGroup?.id ?? null,
      subjectIdData
    });
    setActiveVisit({
      ...visit,
      subject: { ...visit.subject, firstName: subjectIdData.firstName, lastName: subjectIdData.lastName }
    });
  };

  return (
    <React.Fragment>
      <PageHeader title={t('addVisit')} />
      <AddVisitForm onSubmit={(data) => void handleSubmit(data)} />
    </React.Fragment>
  );
};
