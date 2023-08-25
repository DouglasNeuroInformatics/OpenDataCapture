import React from 'react';

import { Form } from '@douglasneuroinformatics/ui';

type SetupData = {
  adminUsername: string;
  adminPassword: string;
};

type SetupFormProps = {
  onSubmit: (data: SetupData) => void;
};

export const SetupForm = ({ onSubmit }: SetupFormProps) => {
  return (
    <Form<SetupData>
      content={{
        adminUsername: {
          kind: 'text',
          label: 'Admin Username',
          variant: 'short'
        },
        adminPassword: {
          kind: 'text',
          label: 'Admin Password',
          variant: 'password'
        }
      }}
      errorMessages={{
        adminUsername: 'Please enter at least 1 character',
        adminPassword: 'Please enter at least 8 characters'
      }}
      validationSchema={{
        type: 'object',
        properties: {
          adminUsername: {
            type: 'string',
            minLength: 1
          },
          adminPassword: {
            type: 'string',
            minLength: 8
          }
        },
        required: ['adminUsername', 'adminPassword']
      }}
      onSubmit={onSubmit}
    />
  );
};
