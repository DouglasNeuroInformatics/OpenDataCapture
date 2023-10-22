/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui';
import type { SubjectIdentificationData } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

export type AddVisitFormData = SubjectIdentificationData;

export type AddVisitFormProps = {
  onSubmit: (data: AddVisitFormData) => void;
};

export const AddVisitForm = ({ onSubmit }: AddVisitFormProps) => {
  const { t } = useTranslation('common');

  return (
    <Form<AddVisitFormData>
      content={{
        firstName: {
          description: t('identificationData.firstName.description'),
          kind: 'text',
          label: t('identificationData.firstName.label'),
          variant: 'short'
        },
        lastName: {
          description: t('identificationData.lastName.description'),
          kind: 'text',
          label: t('identificationData.lastName.label'),
          variant: 'short'
        },
        dateOfBirth: {
          kind: 'date',
          label: t('identificationData.dateOfBirth.label')
        },
        sex: {
          description: t('identificationData.sex.description'),
          kind: 'options',
          label: t('identificationData.sex.label'),
          options: {
            female: t('sex.female'),
            male: t('sex.male')
          }
        }
      }}
      submitBtnLabel={t('identificationData.submit')}
      validationSchema={{
        additionalProperties: false,
        errorMessage: {
          properties: {
            dateOfBirth: t('form.errors.required'),
            firstName: t('form.errors.required'),
            lastName: t('form.errors.required'),
            sex: t('form.errors.required')
          }
        },
        properties: {
          dateOfBirth: {
            format: 'date',
            type: 'string'
          },
          firstName: {
            minLength: 1,
            type: 'string'
          },
          lastName: {
            minLength: 1,
            type: 'string'
          },
          sex: {
            enum: ['male', 'female'],
            type: 'string'
          }
        },
        required: ['firstName', 'lastName', 'sex', 'dateOfBirth'],
        type: 'object'
      }}
      onSubmit={onSubmit}
    />
  );
};
