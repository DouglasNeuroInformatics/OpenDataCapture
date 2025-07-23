/* eslint-disable perfectionist/sort-objects */

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Card, Form, Heading, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { LoadingPage, Logo } from '@opendatacapture/react-core';
import { createFileRoute, Navigate, redirect, useRouter } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { useCreateSetupStateMutation } from '@/hooks/useCreateSetupStateMutation';
import { setupStateQueryOptions } from '@/hooks/useSetupStateQuery';

const RouteComponent = () => {
  const router = useRouter();
  const createSetupStateMutation = useCreateSetupStateMutation();
  const { t } = useTranslation();

  if (createSetupStateMutation.isPending) {
    return <LoadingPage subtitle={t('setup.loadingSubtitle')} title={t('setup.loadingTitle')} />;
  } else if (createSetupStateMutation.isSuccess) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full grow px-4 sm:m-8 sm:max-w-xl sm:grow-0 md:max-w-2xl">
        <Card.Header className="flex items-center justify-center">
          <Logo className="m-2 h-auto w-16" variant="auto" />
          <Heading variant="h2">{t('setup.pageTitle')}</Heading>
        </Card.Header>
        <Card.Content>
          <Form
            content={[
              {
                description: t('setup.admin.description'),
                fields: {
                  firstName: {
                    kind: 'string',
                    label: t('core.identificationData.firstName.label'),
                    variant: 'input'
                  },
                  lastName: {
                    kind: 'string',
                    label: t('core.identificationData.lastName.label'),
                    variant: 'input'
                  },
                  username: {
                    kind: 'string',
                    label: t('setup.admin.username'),
                    variant: 'input'
                  },
                  password: {
                    calculateStrength: (password) => {
                      return estimatePasswordStrength(password).score;
                    },
                    kind: 'string',
                    label: t('setup.admin.password'),
                    variant: 'password'
                  },
                  confirmPassword: {
                    kind: 'string',
                    label: t('common.confirmPassword'),
                    variant: 'password'
                  }
                },
                title: t('setup.admin.title')
              },
              {
                description: t('setup.demo.description'),
                fields: {
                  enableExperimentalFeatures: {
                    kind: 'boolean',
                    label: t('setup.enableExperimentalFeatures'),
                    variant: 'radio'
                  },
                  initDemo: {
                    kind: 'boolean',
                    label: t('setup.demo.init'),
                    options: {
                      false: t('core.no'),
                      true: t('core.yes')
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
                        label: t('setup.demo.dummySubjectCount'),
                        variant: 'input'
                      };
                    },
                    deps: ['initDemo']
                  },
                  recordsPerSubject: {
                    kind: 'dynamic',
                    render: (data) => {
                      if (!data?.initDemo) {
                        return null;
                      }
                      return {
                        kind: 'number',
                        label: t('setup.demo.recordsPerSubject'),
                        variant: 'input'
                      };
                    },
                    deps: ['initDemo']
                  }
                },
                title: t('setup.demo.title')
              }
            ]}
            data-cy="setup-form"
            initialValues={{
              enableExperimentalFeatures: false
            }}
            submitBtnLabel={t('core.submit')}
            validationSchema={z
              .object({
                firstName: z.string().min(1),
                lastName: z.string().min(1),
                username: z.string().min(1),
                password: z
                  .string()
                  .min(1)
                  .refine((val) => estimatePasswordStrength(val).success, t('common.insufficientPasswordStrength')),
                confirmPassword: z.string().min(1),
                initDemo: z.boolean(),
                enableExperimentalFeatures: z.boolean(),
                recordsPerSubject: z.number().int().nonnegative().optional(),
                dummySubjectCount: z.number().int().nonnegative().optional()
              })
              .check((ctx) => {
                if (ctx.value.confirmPassword !== ctx.value.password) {
                  ctx.issues.push({
                    code: 'custom',
                    input: ctx.value.confirmPassword,
                    message: t('common.passwordsMustMatch'),
                    path: ['confirmPassword']
                  });
                }
              })}
            onSubmit={async ({
              dummySubjectCount,
              enableExperimentalFeatures,
              firstName,
              initDemo,
              lastName,
              password,
              recordsPerSubject,
              username
            }) => {
              await createSetupStateMutation.mutateAsync({
                admin: {
                  firstName,
                  lastName,
                  password,
                  username
                },
                dummySubjectCount,
                enableExperimentalFeatures,
                initDemo,
                recordsPerSubject
              });
              await router.invalidate({});
            }}
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

export const Route = createFileRoute('/setup')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const setupState = await context.queryClient.fetchQuery(setupStateQueryOptions());
    if (setupState.isSetup) {
      throw redirect({ to: '/' });
    }
  }
});
