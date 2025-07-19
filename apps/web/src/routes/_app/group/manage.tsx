import React, { useMemo } from 'react';

import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $RegexString } from '@opendatacapture/schemas/core';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { WithFallback } from '@/components/WithFallback';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateGroupMutation } from '@/hooks/useUpdateGroupMutation';
import { useAppStore } from '@/store';

type AvailableInstrumentOptions = {
  form: { [key: string]: string };
  interactive: { [key: string]: string };
  series: { [key: string]: string };
  unknown: { [key: string]: string };
};

type ManageGroupFormProps = {
  data: {
    availableInstrumentOptions: AvailableInstrumentOptions;
    initialValues: {
      accessibleFormInstrumentIds: Set<string>;
      accessibleInteractiveInstrumentIds: Set<string>;
      defaultIdentificationMethod?: SubjectIdentificationMethod;
      idValidationRegex?: null | string;
      subjectIdDisplayLength?: number;
    };
  };
  onSubmit: (data: Partial<UpdateGroupData>) => Promisable<any>;
  readOnly: boolean;
};

const ManageGroupForm = ({ data, onSubmit, readOnly }: ManageGroupFormProps) => {
  const { availableInstrumentOptions, initialValues } = data;
  const { t } = useTranslation();

  let description = t('group.manage.accessibleInstrumentsDesc');
  if (readOnly) {
    description += ` ${t('group.manage.accessibleInstrumentDemoNote')}`;
  }

  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          description,
          fields: {
            accessibleFormInstrumentIds: {
              kind: 'set',
              label: t('group.manage.forms'),
              options: availableInstrumentOptions.form,
              variant: 'listbox'
            },
            accessibleInteractiveInstrumentIds: {
              kind: 'set',
              label: t('group.manage.interactive'),
              options: availableInstrumentOptions.interactive,
              variant: 'listbox'
            }
          },
          title: t('group.manage.accessibleInstruments')
        },
        {
          fields: {
            subjectIdDisplayLength: {
              kind: 'number',
              label: t({
                en: 'Preferred Subject ID Display Length',
                fr: "La longueur d'affichage préférée de l'ID"
              }),
              variant: 'input'
            }
          },
          title: t({
            en: 'Display Settings',
            fr: "Paramètres d'affichage"
          })
        },
        {
          fields: {
            defaultIdentificationMethod: {
              kind: 'string',
              label: t('group.manage.defaultSubjectIdMethod'),
              options: {
                CUSTOM_ID: t('common.customIdentifier'),
                PERSONAL_INFO: t('common.personalInfo')
              },
              variant: 'select'
            },
            idValidationRegex: {
              description: t({
                en: 'Define a custom regular expression to validate subject IDs (see https://regexr.com for help designing your regular expression).',
                fr: "Définir une expression régulière pour valider les identifiants des sujets (voir https://regexr.com pour obtenir de l'aide dans la conception de votre expression régulière)."
              }),
              kind: 'string',
              label: t({
                en: 'ID Validation Pattern',
                fr: 'TBD'
              }),
              variant: 'input'
            },
            idValidationRegexErrorMessageEn: {
              deps: ['idValidationRegex'],
              kind: 'dynamic',
              render: (data) => {
                if (!data.idValidationRegex) {
                  return null;
                }
                return {
                  kind: 'string',
                  label: t({
                    en: 'Custom ID Validation Message (English)',
                    fr: 'Message de validation spécifique (en anglais)'
                  }),
                  variant: 'input'
                };
              }
            },
            idValidationRegexErrorMessageFr: {
              deps: ['idValidationRegex'],
              kind: 'dynamic',
              render: (data) => {
                if (!data.idValidationRegex) {
                  return null;
                }
                return {
                  kind: 'string',
                  label: t({
                    en: 'Custom ID Validation Message (French)',
                    fr: 'Message de validation spécifique (en français)'
                  }),
                  variant: 'input'
                };
              }
            }
          },
          title: t('group.manage.groupSettings')
        }
      ]}
      initialValues={initialValues}
      preventResetValuesOnReset={true}
      readOnly={readOnly}
      validationSchema={z.object({
        accessibleFormInstrumentIds: z.set(z.string()),
        accessibleInteractiveInstrumentIds: z.set(z.string()),
        defaultIdentificationMethod: $SubjectIdentificationMethod.optional(),
        idValidationRegex: $RegexString.optional(),
        idValidationRegexErrorMessageEn: z.string().optional(),
        idValidationRegexErrorMessageFr: z.string().optional(),
        subjectIdDisplayLength: z.number().int().min(1)
      })}
      onSubmit={(data) => {
        void onSubmit({
          accessibleInstrumentIds: [...data.accessibleFormInstrumentIds, ...data.accessibleInteractiveInstrumentIds],
          settings: {
            defaultIdentificationMethod: data.defaultIdentificationMethod,
            idValidationRegex: data.idValidationRegex,
            idValidationRegexErrorMessage: {
              en: data.idValidationRegexErrorMessageEn,
              fr: data.idValidationRegexErrorMessageFr
            },
            subjectIdDisplayLength: data.subjectIdDisplayLength
          }
        });
      }}
    />
  );
};

const RouteComponent = () => {
  const { resolvedLanguage, t } = useTranslation('group');
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const updateGroupMutation = useUpdateGroupMutation();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const changeGroup = useAppStore((store) => store.changeGroup);
  const setupState = useSetupStateQuery();

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

export const Route = createFileRoute('/_app/group/manage')({
  component: RouteComponent
});
