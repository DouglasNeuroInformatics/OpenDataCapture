/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { $SessionType, type CreateSessionData } from '@opendatacapture/schemas/session';
import { generateSubjectHash } from '@opendatacapture/subject-hash';
import { useTranslation } from 'react-i18next';
import type { Promisable } from 'type-fest';
import { z } from 'zod';

import { useAppStore } from '@/store';

const currentDate = new Date();

const EIGHTEEN_YEARS = 568025136000; // milliseconds

const MIN_DATE_OF_BIRTH = new Date(currentDate.getTime() - EIGHTEEN_YEARS);

export type StartSessionFormProps = {
  defaultIdentificationMethod: 'CUSTOM_ID' | 'PERSONAL_INFO';
  onSubmit: (data: CreateSessionData) => Promisable<void>;
};

export const StartSessionForm = ({ defaultIdentificationMethod, onSubmit }: StartSessionFormProps) => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation(['core', 'session']);
  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          title: 'Identification Method',
          description: 'Please select the method by which a subject will be identified for this session.',
          fields: {
            subjectIdentificationMethod: {
              kind: 'string',
              label: 'Method',
              options: {
                CUSTOM_ID: 'Custom Identifier',
                PERSONAL_INFO: 'Personal Information'
              },
              variant: 'select'
            }
          }
        },
        {
          title: t('session:subjectIdentification.title'),
          fields: {
            subjectId: {
              kind: 'dynamic',
              deps: ['subjectIdentificationMethod'],
              render({ subjectIdentificationMethod }) {
                return subjectIdentificationMethod === 'CUSTOM_ID'
                  ? {
                      kind: 'string',
                      label: 'Subject ID',
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
                      description: t('session:subjectIdentification.firstName.description'),
                      kind: 'string',
                      label: t('session:subjectIdentification.firstName.label'),
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
                      description: t('session:subjectIdentification.lastName.description'),
                      kind: 'string',
                      label: t('session:subjectIdentification.lastName.label'),
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
        subjectIdentificationMethod: defaultIdentificationMethod
      }}
      submitBtnLabel={t('submit')}
      validationSchema={z
        .object({
          subjectFirstName: z.string().optional(),
          subjectLastName: z.string().optional(),
          subjectIdentificationMethod: z.enum(['CUSTOM_ID', 'PERSONAL_INFO']),
          subjectId: z.string().min(1).optional(),
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
