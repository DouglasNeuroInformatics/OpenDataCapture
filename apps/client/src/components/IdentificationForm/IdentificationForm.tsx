import React from 'react';

import { Sex } from '@douglasneuroinformatics/common';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';
import { useActiveSubjectStore } from '@/stores/active-subject-store';

type IdentificationFormData = {
  firstName: string;
  lastName: string;
  sex: Sex;
  dateOfBirth: string;
};

export interface IdentificationFormProps {
  /** Whether to prefill the form with the active subject, if one exists  */
  fillActiveSubject?: boolean;

  /** Optional override for the default submit button label */
  submitBtnLabel?: string;

  /** Callback function invoked when validation is successful */
  onSubmit: (data: IdentificationFormData) => void;
}

export const IdentificationForm = ({ fillActiveSubject, submitBtnLabel, onSubmit }: IdentificationFormProps) => {
  const { activeSubject } = useActiveSubjectStore();
  const { t } = useTranslation(['common']);

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
      initialValues={fillActiveSubject ? activeSubject : undefined}
      submitBtnLabel={submitBtnLabel ?? t('identificationForm.submit')}
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
            firstName: t('form.errors.required'),
            lastName: t('form.errors.required'),
            sex: t('form.errors.required'),
            dateOfBirth: t('form.errors.required')
          }
        }
      }}
      onSubmit={onSubmit}
    />
  );
};

export type { IdentificationFormData };
