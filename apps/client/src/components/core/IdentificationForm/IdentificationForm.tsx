import React from 'react';

import { JSONSchemaType } from 'ajv';

import { Form, FormFields } from '@/components/form';

export type IdentificationFormData = {
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
};

export const identificationFormFields: FormFields<IdentificationFormData> = {
  firstName: {
    kind: 'text',
    label: 'First Name',
    variant: 'short'
  },
  lastName: {
    kind: 'text',
    label: 'Last Name',
    variant: 'short'
  },
  sex: {
    kind: 'select',
    label: 'Sex',
    options: ['Male', 'Female']
  },
  dateOfBirth: {
    kind: 'date',
    label: 'Date of Birth'
  }
};

export const identificationFormSchema: JSONSchemaType<IdentificationFormData> = {
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
      enum: ['Male', 'Female']
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
  return <Form fields={identificationFormFields} schema={identificationFormSchema} onSubmit={onSubmit} />;
};
