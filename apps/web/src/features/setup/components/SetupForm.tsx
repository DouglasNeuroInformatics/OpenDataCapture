/* eslint-disable perfectionist/sort-objects */

import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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
  const { t } = useTranslation(['common', 'setup']);
  return (
    <Form<SetupData>
      content={[
        {
          description: t('setup:admin.description'),
          fields: {
            firstName: {
              kind: 'text',
              label: t('identificationData.firstName.label'),
              variant: 'short'
            },
            lastName: {
              kind: 'text',
              label: t('identificationData.lastName.label'),
              variant: 'short'
            },
            username: {
              kind: 'text',
              label: t('setup:admin.username'),
              variant: 'short'
            },
            password: {
              kind: 'text',
              label: t('setup:admin.password'),
              variant: 'password'
            }
          },
          title: t('setup:admin.title')
        },
        {
          description: t('setup:demo.description'),
          fields: {
            initDemo: {
              kind: 'binary',
              label: t('setup:demo.init'),
              options: {
                f: t('no'),
                t: t('yes')
              },
              variant: 'radio'
            }
          },
          title: t('setup:demo.title')
        }
      ]}
      submitBtnLabel={t('submit')}
      validationSchema={z.object({
        firstName: z.string(),
        lastName: z.string(),
        username: z.string(),
        password: z.string().regex(isStrongPassword),
        initDemo: z.boolean()
      })}
      onSubmit={onSubmit}
    />
  );
};

export { type SetupData, SetupForm };
