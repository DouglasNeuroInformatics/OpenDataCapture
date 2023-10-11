/* eslint-disable perfectionist/sort-objects */
import { Form } from '@douglasneuroinformatics/ui';
import type { LoginCredentials } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';

export type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { t } = useTranslation();
  return (
    <Form<LoginCredentials>
      content={{
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
      }}
      submitBtnLabel={t('login')}
      validationSchema={{
        additionalProperties: false,
        errorMessage: {
          properties: {
            password: t('form.errors.required'),
            username: t('form.errors.required')
          }
        },
        properties: {
          password: {
            minLength: 1,
            type: 'string'
          },
          username: {
            minLength: 1,
            type: 'string'
          }
        },
        required: ['username', 'password'],
        type: 'object'
      }}
      onSubmit={onSubmit}
    />
  );
};
