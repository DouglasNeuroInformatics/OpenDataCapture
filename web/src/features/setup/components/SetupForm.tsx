import React from 'react';

import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

type SetupData = {
  username: string;
  password: string;
  initDemo: boolean;
};

type SetupFormProps = {
  onSubmit: (data: SetupData) => void;
};

// Matches string with 8 or more characters, minimum one upper case, lowercase, and number
const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const SetupForm = ({ onSubmit }: SetupFormProps) => {
  const { t } = useTranslation();
  return (
    <Form<SetupData>
      content={[
        {
          title: t('setup.admin.title'),
          description: t('setup.admin.description'),
          fields: {
            username: {
              kind: 'text',
              label: t('username'),
              variant: 'short'
            },
            password: {
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
              variant: 'radio',
              options: {
                t: t('yes'),
                f: t('no')
              }
            }
          }
        }
      ]}
      submitBtnLabel={t('form.submit')}
      validationSchema={{
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 1
          },
          password: {
            type: 'string',
            pattern: isStrongPassword.source
          },
          initDemo: {
            type: 'boolean'
          }
        },
        required: ['username', 'password', 'initDemo']
      }}
      onSubmit={onSubmit}
    />
  );
};

export { SetupForm, type SetupData };
