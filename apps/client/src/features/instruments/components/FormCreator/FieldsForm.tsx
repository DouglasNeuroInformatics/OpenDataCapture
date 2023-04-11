/* eslint-disable no-alert */
import React, { useContext } from 'react';

import { FormFieldKind, NumericFormField, TextFormField } from '@ddcp/common';

import { Form } from '@/components';
import { StepperContext } from '@/context/StepperContext';

export type FieldsFormData = {
  fields: Array<{
    name: string;
    kind: FormFieldKind;
    label: string;
    description: string;
    variant?: TextFormField['variant'] | NumericFormField['variant'];
    options?: string;
  }>;
};

export interface FieldsFormProps {
  onSubmit: (data: FieldsFormData) => void;
}

export const FieldsForm = ({ onSubmit }: FieldsFormProps) => {
  const { updateIndex } = useContext(StepperContext);

  return (
    <Form<FieldsFormData>
      content={{
        fields: {
          kind: 'array',
          label: 'Field',
          fieldset: {
            name: {
              kind: 'text',
              label: 'Name',
              variant: 'short'
            },
            kind: {
              kind: 'options',
              label: 'Kind',
              options: {
                text: 'Text',
                numeric: 'Numeric',
                options: 'Options',
                date: 'Date',
                binary: 'Binary',
                array: 'Array'
              }
            },
            label: {
              kind: 'text',
              label: 'Label',
              variant: 'short'
            },
            description: {
              kind: 'text',
              label: 'Description',
              variant: 'short'
            },
            variant: ({ kind }) => {
              const base = { kind: 'options', label: 'Variant' } as const;
              switch (kind) {
                case 'numeric':
                  return {
                    ...base,
                    options: {
                      default: 'Default',
                      slider: 'Slider'
                    }
                  };
                case 'text':
                  return {
                    ...base,
                    options: {
                      short: 'Short',
                      long: 'Long',
                      password: 'Password'
                    }
                  };
                default:
                  return null;
              }
            },
            options: ({ kind }) => {
              return kind === 'options'
                ? {
                    description: 'Please enter all options',
                    kind: 'text',
                    label: 'Options',
                    variant: 'long'
                  }
                : null;
            }
          }
        }
      }}
      validationSchema={{
        type: 'object',
        required: []
      }}
      onSubmit={(data) => {
        onSubmit(data);
        updateIndex('increment');
      }}
    />
  );
};
