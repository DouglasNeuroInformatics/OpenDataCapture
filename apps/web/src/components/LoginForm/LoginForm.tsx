/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import { z } from 'zod/v4';

type LoginFormProps = {
  onSubmit: (credentials: $LoginCredentials) => void;
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
      data-testid="login-form"
      submitBtnLabel={t('login')}
      validationSchema={z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      })}
      onSubmit={onSubmit}
    />
  );
};
