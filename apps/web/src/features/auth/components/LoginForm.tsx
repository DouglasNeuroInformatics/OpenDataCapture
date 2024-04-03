/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/libui/components';
import type { LoginCredentials } from '@opendatacapture/schemas/auth';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { t } = useTranslation('auth');
  return (
    <Form
      content={{
        username: {
          kind: 'string',
          label: t('username'),
          variant: 'input'
        },
        password: {
          kind: 'string',
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
