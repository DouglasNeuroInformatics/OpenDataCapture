import React from 'react';

import { Sex } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';

type IdentificationFormData = {
  firstName: string;
  lastName: string;
  sex: Sex;
  dateOfBirth: string;
};

export interface IdentificationFormProps {
  onSubmit: (data: IdentificationFormData) => void;
}

export const IdentificationForm = ({ onSubmit }: IdentificationFormProps) => {
  const { t } = useTranslation('common');

  return (
    <Form<IdentificationFormData>
      content={{
        firstName: {
          kind: 'text',
          label: t('identificationForm.firstName.label'),
          variant: 'short',
          description: t('identificationForm.firstName.description')
        },
        lastName: {
          kind: 'text',
          label: t('identificationForm.lastName.label'),
          variant: 'short',
          description: t('identificationForm.lastName.description')
        },
        sex: {
          kind: 'options',
          label: t('identificationForm.sex.label'),
          options: {
            male: t('sex.male'),
            female: t('sex.female')
          },
          description: t('identificationForm.sex.description')
        },
        dateOfBirth: {
          kind: 'date',
          label: t('identificationForm.dateOfBirth.label')
        }
      }}
      submitBtnLabel={t('identificationForm.submit')}
      validationSchema={{
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            minLength: 1
          },
          lastName: {
            type: 'string',
            minLength: 1
          },
          sex: {
            type: 'string',
            enum: ['male', 'female']
          },
          dateOfBirth: {
            type: 'string',
            format: 'date'
          }
        },
        additionalProperties: false,
        required: ['firstName', 'lastName', 'sex', 'dateOfBirth']
      }}
      onSubmit={onSubmit}
    />
  );
};

export type { IdentificationFormData };
