/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/libui/components';
import { $LoginCredentials } from '@opendatacapture/schemas/auth';

type LoginFormProps = {
  onSubmit: (credentials: $LoginCredentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  return (
    <Form
      content={{
        username: {
          kind: 'string',
          label: 'Username',
          variant: 'input'
        },
        password: {
          kind: 'string',
          label: 'Password',
          variant: 'password'
        }
      }}
      submitBtnLabel="Login"
      validationSchema={$LoginCredentials}
      onSubmit={onSubmit}
    />
  );
};
