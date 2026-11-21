/* eslint-disable perfectionist/sort-objects -- the form renders fields in key order, so they must follow the order the user fills them in */

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Sex } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { useCustomIdentificationFields } from '@/hooks/useCustomIdentificationFields';
import { useSubjectIdentificationMethodOptions } from '@/hooks/useSubjectIdentificationMethodOptions';
import { useSubjectIdentificationSettingsQuery } from '@/hooks/useSubjectIdentificationSettingsQuery';
import { useAppStore } from '@/store';

type IdentificationFormProps = {
  onSubmit: (data: { id: string }) => Promisable<void>;
};

export const IdentificationForm = ({ onSubmit }: IdentificationFormProps) => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation();
  const subjectIdentificationSettingsQuery = useSubjectIdentificationSettingsQuery();
  const customFields = useCustomIdentificationFields(subjectIdentificationSettingsQuery.data.customFields);
  const { options: methodOptions, preferMethod } = useSubjectIdentificationMethodOptions(
    subjectIdentificationSettingsQuery.data
  );

  return (
    <Form
      preventResetValuesOnReset
      suspendWhileSubmitting
      content={[
        {
          title: t('common.identificationMethod'),
          fields: {
            subjectIdentificationMethod: {
              kind: 'string',
              label: 'Method',
              options: methodOptions,
              variant: 'select'
            }
          }
        },
        {
          title: t('common.subjectIdentification.title'),
          fields: {
            id: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'CUSTOM_ID'
                  ? {
                      kind: 'string',
                      label: t('common.identifier'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            ...customFields.formFields,
            firstName: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      description: t('common.subjectIdentification.firstName.description'),
                      kind: 'string',
                      label: t('common.subjectIdentification.firstName.label'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            lastName: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      description: t('common.subjectIdentification.lastName.description'),
                      kind: 'string',
                      label: t('common.subjectIdentification.lastName.label'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            dateOfBirth: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      kind: 'date',
                      label: t('core.identificationData.dateOfBirth.label')
                    }
                  : null;
              }
            },
            sex: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      description: t('core.identificationData.sex.description'),
                      kind: 'string',
                      label: t('core.identificationData.sex.label'),
                      options: {
                        FEMALE: t('core.identificationData.sex.female'),
                        MALE: t('core.identificationData.sex.male')
                      },
                      variant: 'select'
                    }
                  : null;
              }
            }
          }
        }
      ]}
      data-testid="identification-form"
      initialValues={{
        subjectIdentificationMethod: preferMethod(currentGroup?.settings.defaultIdentificationMethod ?? 'PERSONAL_INFO')
      }}
      submitBtnLabel={t('core.submit')}
      validationSchema={z
        .object({
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          subjectIdentificationMethod: z.enum(Object.keys(methodOptions)),
          id: z.string().min(1).optional(),
          dateOfBirth: z.date().optional(),
          sex: $Sex.optional(),
          ...customFields.shape
        })
        .superRefine((val, ctx) => {
          if (val.subjectIdentificationMethod === 'CUSTOM_ID') {
            if (!val.id) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('core.form.requiredField'),
                path: ['id']
              });
            }
          } else if (val.subjectIdentificationMethod === 'CUSTOM_FIELDS') {
            for (const [key, message] of Object.entries(customFields.findErrors(val))) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [key] });
            }
          } else {
            const requiredKeys = ['firstName', 'lastName', 'sex', 'dateOfBirth'] as const;
            for (const key of requiredKeys) {
              if (!val[key]) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('core.form.requiredField'),
                  path: [key]
                });
              }
            }
          }
        })}
      onSubmit={async (values) => {
        const { firstName, lastName, dateOfBirth, sex } = values;
        let { id } = values;
        if (values.subjectIdentificationMethod === 'CUSTOM_FIELDS') {
          id = await customFields.deriveSubjectId(values);
        } else if (!id) {
          id = await generateSubjectHash({
            firstName: firstName!,
            lastName: lastName!,
            dateOfBirth: dateOfBirth!,
            sex: sex!
          });
        } else {
          id = encodeScopedSubjectId(id, {
            groupName: currentGroup?.name ?? 'root'
          });
        }
        await onSubmit({ id });
      }}
    />
  );
};
