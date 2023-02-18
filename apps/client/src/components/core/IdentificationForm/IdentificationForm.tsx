import React from 'react';

import { JSONSchemaType } from 'ajv';

import { Form, FormStructure } from '@/components/form';

type IdentificationFormData = {
  firstName: string;
  lastName: string;
  sex: 'male' | 'female';
  dateOfBirth: string;
};

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
        options: ['male', 'female'],
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
      enum: ['male', 'female']
    },
    dateOfBirth: {
      type: 'string',
      format: 'date'
    }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'sex', 'dateOfBirth']
};

export interface IdentificationFormProps {
  onSubmit: (data: IdentificationFormData) => void;
}

export const IdentificationForm = ({ onSubmit }: IdentificationFormProps) => {
  return <Form structure={structure} validationSchema={validationSchema} onSubmit={onSubmit} />;
};

export type { IdentificationFormData };
