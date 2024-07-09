/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { Card, Form, Heading, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { Logo } from '@opendatacapture/react-core';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const $StrongPassword = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{12,}$/, {
  message:
    'Password must be string of 12 or more characters, with a minimum of one upper case letter, lowercase letter, and number'
});

type SetupData = z.infer<typeof $SetupData>;
const $SetupData = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(1),
  password: $StrongPassword,
  initDemo: z.boolean(),
  dummySubjectCount: z.number().int().nonnegative().optional()
});

export type SetupPageProps = {
  onSubmit: (data: SetupData) => void;
};
//
export const SetupPage = ({ onSubmit }: SetupPageProps) => {
  const { t } = useTranslation(['core', 'setup']);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full grow px-4 sm:m-8 sm:max-w-xl sm:grow-0 md:max-w-2xl">
        <Card.Header className="flex items-center justify-center">
          <Logo className="m-2 h-auto w-16" variant="auto" />
          <Heading variant="h2">{t('setup:pageTitle')}</Heading>
        </Card.Header>
        <Card.Content>
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
            validationSchema={$SetupData}
            onSubmit={onSubmit}
          />
        </Card.Content>
        <Card.Footer className="text-muted-foreground flex justify-between gap-3">
          <p className="text-sm">&copy; {new Date().getFullYear()} Douglas Neuroinformatics Platform</p>
          <div className="flex gap-2">
            <LanguageToggle
              align="start"
              options={{
                en: 'English',
                fr: 'Français'
              }}
              triggerClassName="border p-2"
              variant="ghost"
            />
            <ThemeToggle className="border p-2" variant="ghost" />
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};
