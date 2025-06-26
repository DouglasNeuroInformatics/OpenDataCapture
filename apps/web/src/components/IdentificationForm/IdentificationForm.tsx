/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Sex, $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { useAppStore } from '@/store';

type IdentificationFormProps = {
  onSubmit: (data: { id: string }) => Promisable<void>;
};

export const IdentificationForm = ({ onSubmit }: IdentificationFormProps) => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation();

  return (
    <Form
      preventResetValuesOnReset
      suspendWhileSubmitting
      content={[
        {
          title: t('common.identificationMethod'),
          fields: {
            identificationMethod: {
              kind: 'string',
              label: 'Method',
              options: {
                CUSTOM_ID: t('common.customIdentifier'),
                PERSONAL_INFO: t('common.personalInfo')
              },
              variant: 'select'
            }
          }
        },
        {
          title: t('common.subjectIdentification.title'),
          fields: {
            id: {
              kind: 'dynamic',
              deps: ['identificationMethod'],
              render({ identificationMethod }) {
                return identificationMethod === 'CUSTOM_ID'
                  ? {
                      kind: 'string',
                      label: t('common.identifier'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            firstName: {
              kind: 'dynamic',
              deps: ['identificationMethod'],
              render({ identificationMethod }) {
                return identificationMethod === 'PERSONAL_INFO'
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
              deps: ['identificationMethod'],
              render({ identificationMethod }) {
                return identificationMethod === 'PERSONAL_INFO'
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
              deps: ['identificationMethod'],
              render({ identificationMethod }) {
                return identificationMethod === 'PERSONAL_INFO'
                  ? {
                      kind: 'date',
                      label: t('core.identificationData.dateOfBirth.label')
                    }
                  : null;
              }
            },
            sex: {
              kind: 'dynamic',
              deps: ['identificationMethod'],
              render({ identificationMethod }) {
                return identificationMethod === 'PERSONAL_INFO'
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
      initialValues={{
        identificationMethod: currentGroup?.settings.defaultIdentificationMethod ?? 'PERSONAL_INFO'
      }}
      submitBtnLabel={t('core.submit')}
      validationSchema={z
        .object({
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          identificationMethod: $SubjectIdentificationMethod,
          id: z.string().min(1).optional(),
          dateOfBirth: z.date().optional(),
          sex: $Sex.optional()
        })
        .superRefine((val, ctx) => {
          if (val.identificationMethod === 'CUSTOM_ID') {
            if (!val.id) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('core.form.requiredField'),
                path: ['id']
              });
            }
          } else if (val.identificationMethod === 'PERSONAL_INFO') {
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
      onSubmit={async ({ id, firstName, lastName, dateOfBirth, sex }) => {
        if (!id) {
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
