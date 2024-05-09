import React, { useMemo } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import type { UnilingualInstrumentSummary } from '@opendatacapture/schemas/instrument';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { useTranslation } from 'react-i18next';
import type { Promisable } from 'type-fest';
import { z } from 'zod';

import { useAppStore } from '@/store';

type InstrumentOptions = {
  form: { [key: string]: string };
  interactive: { [key: string]: string };
  series: { [key: string]: string };
  unknown: { [key: string]: string };
};

export type ManageGroupFormProps = {
  availableInstruments: UnilingualInstrumentSummary[];
  onSubmit: (data: UpdateGroupData) => Promisable<any>;
};

export const ManageGroupForm = ({ availableInstruments, onSubmit }: ManageGroupFormProps) => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { i18n } = useTranslation();
  const { t } = useTranslation(['group', 'common']);

  const { initialValues, options } = useMemo(() => {
    const options: InstrumentOptions = {
      form: {},
      interactive: {},
      series: {},
      unknown: {}
    };
    const initialValues = {
      accessibleFormInstrumentIds: new Set<string>(),
      accessibleInteractiveInstrumentIds: new Set<string>(),
      defaultIdentificationMethod: currentGroup?.settings.defaultIdentificationMethod
    };
    for (const instrument of availableInstruments) {
      if (instrument.kind === 'FORM') {
        options.form[instrument.id] = instrument.details.title;
        if (currentGroup?.accessibleInstrumentIds.includes(instrument.id)) {
          initialValues.accessibleFormInstrumentIds.add(instrument.id);
        }
      } else if (instrument.kind === 'INTERACTIVE') {
        options.interactive[instrument.id] = instrument.details.title;
        if (currentGroup?.accessibleInstrumentIds.includes(instrument.id)) {
          initialValues.accessibleInteractiveInstrumentIds.add(instrument.id);
        }
      }
    }
    return { initialValues, options };
  }, [availableInstruments, currentGroup, i18n.resolvedLanguage]);

  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          description: t('manage.accessibleInstrumentsDesc'),
          fields: {
            accessibleFormInstrumentIds: {
              kind: 'set',
              label: t('manage.forms'),
              options: options.form,
              variant: 'listbox'
            },
            accessibleInteractiveInstrumentIds: {
              kind: 'set',
              label: t('manage.interactive'),
              options: options.interactive,
              variant: 'listbox'
            }
          },
          title: t('manage.accessibleInstruments')
        },
        {
          fields: {
            defaultIdentificationMethod: {
              kind: 'string',
              label: t('manage.defaultSubjectIdMethod'),
              options: {
                CUSTOM_ID: t('common:customIdentifier'),
                PERSONAL_INFO: t('common:personalInfo')
              },
              variant: 'select'
            }
          },
          title: t('manage.groupSettings')
        }
      ]}
      initialValues={initialValues}
      preventResetValuesOnReset={true}
      validationSchema={z.object({
        accessibleFormInstrumentIds: z.set(z.string()),
        accessibleInteractiveInstrumentIds: z.set(z.string()),
        defaultIdentificationMethod: $SubjectIdentificationMethod.optional()
      })}
      onSubmit={(data) =>
        void onSubmit({
          accessibleInstrumentIds: [...data.accessibleFormInstrumentIds, ...data.accessibleInteractiveInstrumentIds],
          settings: {
            defaultIdentificationMethod: data.defaultIdentificationMethod
          }
        })
      }
    />
  );
};
