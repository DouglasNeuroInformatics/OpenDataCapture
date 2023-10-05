import { Form } from '@douglasneuroinformatics/ui';
import type { Sex } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

import { useActiveSubjectStore } from '@/stores/active-subject-store';

type IdentificationFormData = {
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  sex: Sex;
};

export type IdentificationFormProps = {
  /** Whether to prefill the form with the active subject, if one exists  */
  fillActiveSubject?: boolean;

  /** Callback function invoked when validation is successful */
  onSubmit: (data: IdentificationFormData) => void;

  /** Optional override for the default submit button label */
  submitBtnLabel?: string;
};

export const IdentificationForm = ({ fillActiveSubject, onSubmit, submitBtnLabel }: IdentificationFormProps) => {
  const { activeSubject } = useActiveSubjectStore();
  const { t } = useTranslation();

  return (
    <Form<IdentificationFormData>
      content={{
        dateOfBirth: {
          kind: 'date',
          label: t('identificationForm.dateOfBirth.label')
        },
        firstName: {
          description: t('identificationForm.firstName.description'),
          kind: 'text',
          label: t('identificationForm.firstName.label'),
          variant: 'short'
        },
        lastName: {
          description: t('identificationForm.lastName.description'),
          kind: 'text',
          label: t('identificationForm.lastName.label'),
          variant: 'short'
        },
        sex: {
          description: t('identificationForm.sex.description'),
          kind: 'options',
          label: t('identificationForm.sex.label'),
          options: {
            female: t('sex.female'),
            male: t('sex.male')
          }
        }
      }}
      initialValues={fillActiveSubject ? activeSubject : undefined}
      resetBtn={fillActiveSubject}
      submitBtnLabel={submitBtnLabel ?? t('identificationForm.submit')}
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

export type { IdentificationFormData };
