/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

type SetupData = {
  firstName: string;
  initDemo: boolean;
  lastName: string;
  password: string;
  username: string;
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
          description: t('setup.admin.description'),
          fields: {
            firstName: {
              kind: 'text',
              label: t('firstName'),
              variant: 'short'
            },
            lastName: {
              kind: 'text',
              label: t('lastName'),
              variant: 'short'
            },
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
          },
          title: t('setup.admin.title')
        },
        {
          description: t('setup.demo.description'),
          fields: {
            initDemo: {
              kind: 'binary',
              label: t('setup.demo.init'),
              options: {
                f: t('no'),
                t: t('yes')
              },
              variant: 'radio'
            }
          },
          title: t('setup.demo.title')
        }
      ]}
      submitBtnLabel={t('form.submit')}
      validationSchema={{
        properties: {
          firstName: {
            minLength: 1,
            type: 'string'
          },
          initDemo: {
            type: 'boolean'
          },
          lastName: {
            minLength: 1,
            type: 'string'
          },
          password: {
            pattern: isStrongPassword.source,
            type: 'string'
          },
          username: {
            minLength: 1,
            type: 'string'
          }
        },
        required: ['firstName', 'lastName', 'username', 'password', 'initDemo'],
        type: 'object'
      }}
      onSubmit={onSubmit}
    />
  );
};

export { type SetupData, SetupForm };
