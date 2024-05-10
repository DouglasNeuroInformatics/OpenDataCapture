/* eslint-disable perfectionist/sort-objects */

import React, { useEffect, useState } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { $SessionType, type CreateSessionData } from '@opendatacapture/schemas/session';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import { useTranslation } from 'react-i18next';
import type { Promisable } from 'type-fest';
import { z } from 'zod';

import { useAppStore } from '@/store';

const currentDate = new Date();

const EIGHTEEN_YEARS = 568025136000; // milliseconds

const MIN_DATE_OF_BIRTH = new Date(currentDate.getTime() - EIGHTEEN_YEARS);

export type StartSessionFormProps = {
  onSubmit: (data: CreateSessionData) => Promisable<void>;
};

export const StartSessionForm = ({ onSubmit }: StartSessionFormProps) => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);
  const { t } = useTranslation(['core', 'common', 'session']);

  // this is to force reset the form when the session changes, if on the same page
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (currentSession === null) {
      setKey(key + 1);
    }
  }, [currentSession]);

  return (
    <Form
      preventResetValuesOnReset
      className="mx-auto max-w-3xl"
      content={[
        {
          title: t('common:identificationMethod'),
          description: t('common:identificationMethodDesc'),
          fields: {
            subjectIdentificationMethod: {
              kind: 'string',
              label: 'Method',
              options: {
                CUSTOM_ID: t('common:customIdentifier'),
                PERSONAL_INFO: t('common:personalInfo')
              },
              variant: 'select'
            }
          }
        },
        {
          title: t('common:subjectIdentification.title'),
          fields: {
            subjectId: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'CUSTOM_ID'
                  ? {
                      kind: 'string',
                      label: t('common:identifier'),
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
                      description: t('common:subjectIdentification.firstName.description'),
                      kind: 'string',
                      label: t('common:subjectIdentification.firstName.label'),
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
                      description: t('common:subjectIdentification.lastName.description'),
                      kind: 'string',
                      label: t('common:subjectIdentification.lastName.label'),
                      variant: 'input'
                    }
                  : null;
              }
            },
            subjectDateOfBirth: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      kind: 'date',
                      label: t('identificationData.dateOfBirth.label')
                    }
                  : null;
              }
            },
            subjectSex: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'PERSONAL_INFO'
                  ? {
                      description: t('identificationData.sex.description'),
                      kind: 'string',
                      label: t('identificationData.sex.label'),
                      options: {
                        FEMALE: t('identificationData.sex.female'),
                        MALE: t('identificationData.sex.male')
                      },
                      variant: 'select'
                    }
                  : null;
              }
            }
          }
        },
        {
          title: t('session:additionalData.title'),
          fields: {
            sessionType: {
              kind: 'string',
              label: t('session:type.label'),
              variant: 'select',
              options: {
                RETROSPECTIVE: t('session:type.retrospective'),
                IN_PERSON: t('session:type.in-person')
              }
            },
            sessionDate: {
              kind: 'dynamic',
              deps: ['sessionType'],
              render({ sessionType }) {
                return sessionType === 'RETROSPECTIVE'
                  ? {
                      description: t('session:dateAssessed.description'),
                      kind: 'date',
                      label: t('session:dateAssessed.label')
                    }
                  : null;
              }
            }
          }
        }
      ]}
      initialValues={{
        sessionType: 'IN_PERSON',
        subjectIdentificationMethod: currentGroup?.settings.defaultIdentificationMethod ?? 'PERSONAL_INFO'
      }}
      key={key}
      readOnly={currentSession !== null}
      submitBtnLabel={t('submit')}
      validationSchema={z
        .object({
          subjectFirstName: z.string().optional(),
          subjectLastName: z.string().optional(),
          subjectIdentificationMethod: $SubjectIdentificationMethod,
          subjectId: z
            .string()
            .min(1)
            .refine((arg) => !arg.includes('$'), t('common:illegalCharacter', { char: '$' }))
            .optional(),
          subjectDateOfBirth: z
            .date()
            .max(MIN_DATE_OF_BIRTH, { message: t('session:errors.mustBeAdult') })
            .optional(),
          subjectSex: z.enum(['MALE', 'FEMALE']).optional(),
          sessionType: $SessionType.exclude(['REMOTE']),
          sessionDate: z
            .date()
            .max(currentDate, { message: t('session:errors.assessmentMustBeInPast') })
            .default(currentDate)
        })
        .superRefine((val, ctx) => {
          if (val.subjectIdentificationMethod === 'CUSTOM_ID') {
            if (!val.subjectId) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('form.requiredField'),
                path: ['subjectId']
              });
            }
          } else if (val.subjectIdentificationMethod === 'PERSONAL_INFO') {
            const requiredKeys = ['subjectFirstName', 'subjectLastName', 'subjectSex', 'subjectDateOfBirth'] as const;
            for (const key of requiredKeys) {
              if (!val[key]) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('form.requiredField'),
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
            groupName: currentGroup?.name ?? 'root'
          });
        }
        await onSubmit({
          date: sessionDate!,
          groupId: currentGroup?.id ?? null,
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
