import React, { useTransition } from 'react';

import { Sex } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components';

type IdentificationFormData = {
  firstName: string;
  lastName: string;
  sex: Sex;
  dateOfBirth: string;
};

/*
const structure: FormStructure<IdentificationFormData> = [
  {
    fields: {
      firstName: {
        kind: 'text',
        label: 'First Name',
        variant: 'short',
        description: "The subject's first name, as provided by their birth certificate"
      },
      lastName: {
        kind: 'text',
        label: 'Last Name',
        variant: 'short',
        description: "The subject's last name, as provided by their birth certificate"
      },
      sex: {
        kind: 'select',
        label: 'Sex',
        options: Object.values(Sex),
        description: "The subject's biological sex, as assigned at birth"
      },
      dateOfBirth: {
        kind: 'date',
        label: 'Date of Birth',
        description: "The subject's date of birth"
      }
    }
  }
];

const validationSchema: JSONSchemaType<IdentificationFormData> = {
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
      enum: Object.values(Sex)
    },
    dateOfBirth: {
      type: 'string',
      format: 'date'
    }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'sex', 'dateOfBirth']
};
*/

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
          label: t('identificationForm.firstName'),
          variant: 'short'
        },
        lastName: {
          kind: 'text',
          label: t('identificationForm.lastName'),
          variant: 'short'
        },
        sex: {
          kind: 'options',
          label: t('identificationForm.sex'),
          options: {
            MALE: t('sex.male'),
            FEMALE: t('sex.female')
          }
        },
        dateOfBirth: {
          kind: 'date',
          label: t('identificationForm.dateOfBirth')
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
            enum: Object.values(Sex)
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
