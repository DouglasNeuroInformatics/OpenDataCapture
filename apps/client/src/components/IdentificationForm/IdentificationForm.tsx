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
  const { t } = useTranslation(['common', 'form']);

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
        dateOfBirth: {
          kind: 'date',
          label: t('identificationForm.dateOfBirth.label')
        },
        sex: {
          kind: 'options',
          label: t('identificationForm.sex.label'),
          options: {
            male: t('sex.male'),
            female: t('sex.female')
          },
          description: t('identificationForm.sex.description')
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
          dateOfBirth: {
            type: 'string',
            format: 'date'
          },
          sex: {
            type: 'string',
            enum: ['male', 'female']
          }
        },
        additionalProperties: false,
        required: ['firstName', 'lastName', 'sex', 'dateOfBirth'],
        errorMessage: {
          properties: {
            firstName: t('form:errors.required'),
            lastName: t('form:errors.required'),
            sex: t('form:errors.required'),
            dateOfBirth: t('form:errors.required')
          }
        }
      }}
      onSubmit={onSubmit}
    />
  );
};

export type { IdentificationFormData };
