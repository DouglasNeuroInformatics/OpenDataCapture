/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { $StrongPassword } from '@opendatacapture/schemas/user';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type SetupData = {
  dummySubjectCount?: number;
  firstName: string;
  initDemo: boolean;
  lastName: string;
  password: string;
  username: string;
};

type SetupFormProps = {
  onSubmit: (data: SetupData) => void;
};

const SetupForm = ({ onSubmit }: SetupFormProps) => {
  const { t } = useTranslation(['core', 'setup']);
  return (
    <Form
      content={[
        {
          description: t('setup:admin.description'),
          fields: {
            firstName: {
              kind: 'string',
              label: t('identificationData.firstName.label'),
              variant: 'input'
            },
            lastName: {
              kind: 'string',
              label: t('identificationData.lastName.label'),
              variant: 'input'
            },
            username: {
              kind: 'string',
              label: t('setup:admin.username'),
              variant: 'input'
            },
            password: {
              kind: 'string',
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
              kind: 'boolean',
              label: t('setup:demo.init'),
              options: {
                false: t('no'),
                true: t('yes')
              },
              variant: 'radio'
            },
            dummySubjectCount: {
              kind: 'dynamic',
              render: (data) => {
                if (!data?.initDemo) {
                  return null;
                }
                return {
                  kind: 'number',
                  label: t('setup:demo.dummySubjectCount'),
                  variant: 'input'
                };
              },
              deps: ['initDemo']
            }
          },
          title: t('setup:demo.title')
        }
      ]}
      submitBtnLabel={t('submit')}
      validationSchema={z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        username: z.string().min(1),
        password: $StrongPassword,
        initDemo: z.boolean(),
        dummySubjectCount: z.number().int().nonnegative().optional()
      })}
      onSubmit={onSubmit}
    />
  );
};

export { type SetupData, SetupForm };
