/* eslint-disable no-alert */
import React from 'react';

import { FormFieldKind, TextFormField } from '@ddcp/common';

import { Form } from '@/components';

type FieldsFormData = {
  fields: Array<{
    kind: FormFieldKind;
    label: string;
    description: string;
    variant?: TextFormField['variant'];
  }>;
};

export const FieldsForm = () => {
  return (
    <Form<FieldsFormData>
      content={{
        fields: {
          kind: 'array',
          label: 'Field',
          fieldset: {
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
            variant: {
              kind: 'options',
              label: 'Variant',
              options: {
                short: 'Short',
                long: 'Long',
                password: 'Password'
              },
              shouldRender: ({ kind }) => kind === 'text'
            }
          }
        }
      }}
      validationSchema={{
        type: 'object',
        required: []
      }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
    />
  );
};
