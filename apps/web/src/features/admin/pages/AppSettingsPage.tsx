import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateSetupStateData } from '@opendatacapture/schemas/setup';

import { PageHeader } from '@/components/PageHeader';
import { useSetupState } from '@/hooks/useSetupState';

import { AppSettingsForm } from '../components/AppSettingsForm';
import { useUpdateSetupStateMutation } from '../hooks/useUpdateSetupStateMutation';

export const AppSettingsPage = () => {
  const { t } = useTranslation();
  const setupState = useSetupState();
  const updateSetupStateMutation = useUpdateSetupStateMutation();

  const handleSubmit = (data: UpdateSetupStateData) => {
    updateSetupStateMutation.mutate(data);
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Modify Application Settings',
            fr: "Modifier les paramètres de l'application"
          })}
        </Heading>
      </PageHeader>
      {setupState.data && <AppSettingsForm initialValues={setupState.data} onSubmit={handleSubmit} />}
    </React.Fragment>
  );
};
