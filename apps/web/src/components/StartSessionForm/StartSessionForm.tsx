/* eslint-disable perfectionist/sort-objects */

import type { CurrentUser } from '@/store/types';
import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { $SessionType } from '@opendatacapture/schemas/session';
import type { CreateSessionData } from '@opendatacapture/schemas/session';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { Sex, SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

const currentDate = new Date();

const EIGHTEEN_YEARS = 568025136000; // milliseconds

const MIN_DATE_OF_BIRTH = new Date(currentDate.getTime() - EIGHTEEN_YEARS);

type StartSessionFormData = {
  sessionDate: Date;
  sessionType: 'IN_PERSON' | 'RETROSPECTIVE';
  subjectDateOfBirth?: Date;
  subjectFirstName?: string;
  subjectId?: string;
  subjectIdentificationMethod: SubjectIdentificationMethod;
  subjectLastName?: string;
  subjectSex?: Sex;
};

type StartSessionFormProps = {
  currentGroup: Group | null;
  currentUser: CurrentUser | null;
  initialValues?: FormTypes.PartialNullableData<StartSessionFormData>;
  onSubmit: (data: CreateSessionData) => Promisable<void>;
  readOnly: boolean;
};

export const StartSessionForm = ({
  currentGroup,
  currentUser,
  initialValues,
  readOnly,
  onSubmit
}: StartSessionFormProps) => {
  const { resolvedLanguage, t } = useTranslation();
  return (
    <Form
      preventResetValuesOnReset
      suspendWhileSubmitting
      className="mx-auto max-w-3xl"
      content={[
        {
          title: t('common.identificationMethod'),
          description: t('common.identificationMethodDesc'),
          fields: {
            subjectIdentificationMethod: {
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
            subjectId: {
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
            subjectFirstName: {
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
            subjectLastName: {
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
            subjectDateOfBirth: {
              kind: 'date',
              label: t('core.identificationData.dateOfBirth.label')
            },
            subjectSex: {
              description: t('core.identificationData.sex.description'),
              kind: 'string',
              label: t('core.identificationData.sex.label'),
              options: {
                FEMALE: t('core.identificationData.sex.female'),
                MALE: t('core.identificationData.sex.male')
              },
              variant: 'select'
            }
          }
        },
        {
          title: t('session.additionalData.title'),
          fields: {
            sessionType: {
              kind: 'string',
              label: t('session.type.label'),
              variant: 'select',
              options: {
                RETROSPECTIVE: t('session.type.retrospective'),
                IN_PERSON: t('session.type.in-person')
              }
            },
            sessionDate: {
              kind: 'dynamic',
              deps: ['sessionType'],
              render({ sessionType }) {
                return sessionType === 'RETROSPECTIVE'
                  ? {
                      description: t('session.dateAssessed.description'),
                      kind: 'date',
                      label: t('session.dateAssessed.label')
                    }
                  : null;
              }
            }
          }
        }
      ]}
      data-cy="start-session-form"
      initialValues={initialValues}
      readOnly={readOnly}
      submitBtnLabel={t('core.submit')}
      validationSchema={z
        .object({
          subjectFirstName: z.string().optional(),
          subjectLastName: z.string().optional(),
          subjectIdentificationMethod: $SubjectIdentificationMethod,
          subjectId: z
            .string()
            .min(1)
            .refine(
              (arg) => !arg.includes('$'),
              t({
                en: 'Illegal character: $',
                fr: 'Caractère illégal : $'
              })
            )
            .optional(),
          subjectDateOfBirth: z
            .date()
            .max(MIN_DATE_OF_BIRTH, { message: t('session.errors.mustBeAdult') })
            .optional(),
          subjectSex: z.enum(['MALE', 'FEMALE']).optional(),
          sessionType: $SessionType.exclude(['REMOTE']),
          sessionDate: z
            .date()
            .max(currentDate, { message: t('session.errors.assessmentMustBeInPast') })
            .default(currentDate)
        })
        .superRefine((val, ctx) => {
          if (val.subjectIdentificationMethod === 'CUSTOM_ID') {
            if (!val.subjectId) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('core.form.requiredField'),
                path: ['subjectId']
              });
            } else if (currentGroup?.settings.idValidationRegex) {
              try {
                const regex = new RegExp(currentGroup?.settings.idValidationRegex);
                if (!regex.test(val.subjectId)) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                      currentGroup.settings.idValidationRegexErrorMessage?.[resolvedLanguage] ??
                      t({
                        en: `Must match regular expression: ${regex.source}`,
                        fr: `Doit correspondre à l'expression régulière : ${regex.source}`
                      }),
                    path: ['subjectId']
                  });
                }
              } catch (err) {
                // this should be checked already on the backend
                console.error(err);
              }
            }
          } else if (val.subjectIdentificationMethod === 'PERSONAL_INFO') {
            const requiredKeys = ['subjectFirstName', 'subjectLastName', 'subjectSex', 'subjectDateOfBirth'] as const;
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
      onSubmit={async ({
        sessionType,
        sessionDate,
        subjectId,
        subjectFirstName,
        subjectLastName,
        subjectDateOfBirth,
        subjectSex
      }) => {
        if (!subjectId) {
          subjectId = await generateSubjectHash({
            firstName: subjectFirstName!,
            lastName: subjectLastName!,
            dateOfBirth: subjectDateOfBirth!,
            sex: subjectSex!
          });
        } else {
          subjectId = encodeScopedSubjectId(subjectId, {
            groupName: currentGroup?.name ?? DEFAULT_GROUP_NAME
          });
        }
        await onSubmit({
          date: sessionDate,
          groupId: currentGroup?.id ?? null,
          userId: currentUser?.username ?? null,
          type: sessionType,
          subjectData: {
            id: subjectId,
            firstName: subjectFirstName,
            lastName: subjectLastName,
            dateOfBirth: subjectDateOfBirth,
            sex: subjectSex
          }
        });
      }}
    />
  );
};

export type { StartSessionFormData };
