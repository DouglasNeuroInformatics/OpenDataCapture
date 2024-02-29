/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui/legacy';
import type { LoginCredentials } from '@open-data-capture/common/auth';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { t } = useTranslation('auth');
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
      data-cy="login-form"
      submitBtnLabel={t('login')}
      validationSchema={z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      })}
      onSubmit={onSubmit}
    />
  );
};
