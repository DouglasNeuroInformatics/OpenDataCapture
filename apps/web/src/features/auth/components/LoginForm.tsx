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
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 1
          },
          password: {
            type: 'string',
            minLength: 1
          }
        },
        additionalProperties: false,
        required: ['username', 'password'],
        errorMessage: {
          properties: {
            username: t('form.errors.required'),
            password: t('form.errors.required')
          }
        }
      }}
      onSubmit={onSubmit}
    />
  );
};
