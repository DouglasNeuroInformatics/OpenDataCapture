import React, { useMemo } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupState } from '@/hooks/useSetupState';
import { useAppStore } from '@/store';

import { ManageGroupForm } from '../components/ManageGroupForm';
import { useUpdateGroup } from '../hooks/useUpdateGroup';

import type { AvailableInstrumentOptions } from '../components/ManageGroupForm';

export const ManageGroupPage = () => {
  const { resolvedLanguage, t } = useTranslation('group');
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const updateGroupMutation = useUpdateGroup();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const changeGroup = useAppStore((store) => store.changeGroup);
  const setupState = useSetupState();

  const availableInstruments = instrumentInfoQuery.data;

  const accessibleInstrumentIds = currentGroup?.accessibleInstrumentIds;
  const defaultIdentificationMethod = currentGroup?.settings.defaultIdentificationMethod;

  const data = useMemo(() => {
    if (!availableInstruments) {
      return null;
    }
    const availableInstrumentOptions: AvailableInstrumentOptions = {
      form: {},
      interactive: {},
      series: {},
      unknown: {}
    };
    const settings = currentGroup?.settings;
    const initialValues = {
      accessibleFormInstrumentIds: new Set<string>(),
      accessibleInteractiveInstrumentIds: new Set<string>(),
      defaultIdentificationMethod,
      idValidationRegex: settings?.idValidationRegex,
      idValidationRegexErrorMessageEn: settings?.idValidationRegexErrorMessage?.en,
      idValidationRegexErrorMessageFr: settings?.idValidationRegexErrorMessage?.fr
    };
    for (const instrument of availableInstruments) {
      if (instrument.kind === 'FORM') {
        availableInstrumentOptions.form[instrument.id] = instrument.details.title;
        if (accessibleInstrumentIds?.includes(instrument.id)) {
          initialValues.accessibleFormInstrumentIds.add(instrument.id);
        }
      } else if (instrument.kind === 'INTERACTIVE') {
        availableInstrumentOptions.interactive[instrument.id] = instrument.details.title;
        if (accessibleInstrumentIds?.includes(instrument.id)) {
          initialValues.accessibleInteractiveInstrumentIds.add(instrument.id);
        }
      }
    }
    return { availableInstrumentOptions, initialValues };
  }, [
    accessibleInstrumentIds,
    availableInstruments,
    defaultIdentificationMethod,
    resolvedLanguage,
    currentGroup?.settings
  ]);

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('manage.pageTitle')}
        </Heading>
      </PageHeader>
      <WithFallback
        Component={ManageGroupForm}
        props={{
          data,
          onSubmit: async (data) => {
            const updatedGroup = await updateGroupMutation.mutateAsync(data);
            changeGroup(updatedGroup);
          },
          readOnly: Boolean(setupState.data?.isDemo && import.meta.env.PROD)
        }}
      />
    </React.Fragment>
  );
};
