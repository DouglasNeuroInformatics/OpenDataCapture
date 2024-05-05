/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import type { SubjectIdentificationData } from '@opendatacapture/schemas/subject';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const EIGHTEEN_YEARS = 568025136000; // milliseconds

const MIN_DATE_OF_BIRTH = new Date(Date.now() - EIGHTEEN_YEARS);

export type StartSessionFormData = {
  date: Date;
} & SubjectIdentificationData;

export type StartSessionFormProps = {
  onSubmit: (data: StartSessionFormData) => void;
};

export const StartSessionForm = ({ onSubmit }: StartSessionFormProps) => {
  const { t } = useTranslation(['core', 'session']);
  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          title: t('session:subjectIdentification.title'),
          description: t('session:subjectIdentification.description'),
          fields: {
            firstName: {
              description: t('session:subjectIdentification.firstName.description'),
              kind: 'string',
              label: t('session:subjectIdentification.firstName.label'),
              variant: 'input'
            },
            lastName: {
              description: t('session:subjectIdentification.lastName.description'),
              kind: 'string',
              label: t('session:subjectIdentification.lastName.label'),
              variant: 'input'
            },
            dateOfBirth: {
              kind: 'date',
              label: t('identificationData.dateOfBirth.label')
            },
            sex: {
              description: t('identificationData.sex.description'),
              kind: 'string',
              label: t('identificationData.sex.label'),
              options: {
                FEMALE: t('identificationData.sex.female'),
                MALE: t('identificationData.sex.male')
              },
              variant: 'select'
            }
          }
        },
        {
          title: t('session:additionalData.title'),
          fields: {
            date: {
              description: t('session:dateAssessed.description'),
              kind: 'date',
              label: t('session:dateAssessed.label')
            }
          }
        }
      ]}
      initialValues={{
        date: new Date()
      }}
      submitBtnLabel={t('submit')}
      validationSchema={z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date().max(MIN_DATE_OF_BIRTH, { message: t('session:errors.mustBeAdult') }),
        sex: z.enum(['MALE', 'FEMALE']),
        date: z.date().max(new Date(), { message: t('session:errors.assessmentMustBeInPast') })
      })}
      onSubmit={onSubmit}
    />
  );
};
