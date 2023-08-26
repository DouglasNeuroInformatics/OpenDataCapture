import React from 'react';

import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

type SetupData = {
  adminUsername: string;
  adminPassword: string;
  initDemo: boolean;
};

type SetupFormProps = {
  onSubmit: (data: SetupData) => void;
};

export const SetupForm = ({ onSubmit }: SetupFormProps) => {
  const { t } = useTranslation();
  return (
    <Form<SetupData>
      content={[
        {
          title: t('setup.admin.title'),
          description: t('setup.admin.description'),
          fields: {
            adminUsername: {
              kind: 'text',
              label: t('username'),
              variant: 'short'
            },
            adminPassword: {
              kind: 'text',
              label: t('password'),
              variant: 'password'
            }
          }
        },
        {
          title: t('setup.demo.title'),
          description: t('setup.demo.description'),
          fields: {
            initDemo: {
              kind: 'binary',
              label: t('setup.demo.init'),
              variant: 'radio'
            }
          }
        }
      ]}
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
          },
          initDemo: {
            type: 'boolean'
          }
        },
        required: ['adminUsername', 'adminPassword', 'initDemo']
      }}
      onSubmit={onSubmit}
    />
  );
};
