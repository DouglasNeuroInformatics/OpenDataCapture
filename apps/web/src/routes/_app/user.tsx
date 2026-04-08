import { useMemo } from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Sex } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { UserIcon } from '@/components/UserIcon';
import { useUpdateUserMutation } from '@/hooks/useUpdateUserMutation';
import { useUsersQuery } from '@/hooks/useUsersQuery';
import { useAppStore } from '@/store';

type UpdateUserFormData = {
  confirmPassword?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  password?: string | undefined;
};

const RouteComponent = () => {
  const currentUser = useAppStore((store) => store.currentUser);

  const updateUserMutation = useUpdateUserMutation();
  const { resolvedLanguage, t } = useTranslation();
  const userList = useUsersQuery();
  let userInfo;

  if (userList.data) {
    userInfo = userList.data.find((record) => record.id === currentUser?.id);
  }

  let fullName: string;
  if (currentUser?.firstName && currentUser.lastName) {
    fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  } else if (currentUser?.firstName) {
    fullName = currentUser.firstName;
  } else {
    fullName = 'Unnamed User';
  }

  const $UpdateUserFormData = useMemo(() => {
    return z
      .object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        // eslint-disable-next-line perfectionist/sort-objects
        dateOfBirth: z.date().optional(),
        password: z.string().min(1).optional(),
        // eslint-disable-next-line perfectionist/sort-objects
        confirmPassword: z.string().min(1).optional(),
        sex: $Sex
      })
      .check((ctx) => {
        if (ctx.value.password && !estimatePasswordStrength(ctx.value.password).success) {
          ctx.issues.push({
            code: 'custom',
            fatal: true,
            input: ctx.value.password,
            message: t('common.insufficientPasswordStrength'),
            path: ['password']
          });
          return z.NEVER;
        }
      }) satisfies z.ZodType<UpdateUserFormData>;
  }, [resolvedLanguage]);

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'User Info',
            fr: 'Informations utilisateur'
          })}
        </Heading>
      </PageHeader>
      <div className="mt-4 flex flex-col items-center justify-center">
        <UserIcon className="h-16 w-16" />
        <Heading variant="h2">{fullName}</Heading>
        <p className="text-sm">{currentUser?.username ?? fullName}</p>
      </div>
      <Form
        className="mx-auto max-w-3xl"
        content={[
          {
            fields: {
              // username: {
              //   kind: 'string',
              //   label: t('common.username'),
              //   variant: 'input'
              // },

              // eslint-disable-next-line perfectionist/sort-objects
              password: {
                calculateStrength: (password) => {
                  return estimatePasswordStrength(password).score;
                },
                kind: 'string',
                label: t('common.password'),
                variant: 'password'
              },
              // eslint-disable-next-line perfectionist/sort-objects
              confirmPassword: {
                kind: 'string',
                label: t('common.confirmPassword'),
                variant: 'password'
              }
            },
            title: t({
              en: 'Login Credentials',
              fr: 'Identifiants de connexion'
            })
          },
          {
            fields: {
              dateOfBirth: {
                kind: 'date',
                label: t('core.identificationData.dateOfBirth.label')
              },
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
              sex: {
                kind: 'string',
                label: t('core.identificationData.sex.label'),
                options: {
                  FEMALE: t('core.identificationData.sex.female'),
                  MALE: t('core.identificationData.sex.male')
                },
                variant: 'select'
              }
            },
            title: t({
              en: 'Personal Information',
              fr: 'Informations individuel'
            })
          }
        ]}
        initialValues={{
          dateOfBirth: userInfo?.dateOfBirth,
          firstName: currentUser?.firstName ?? 'N/A',
          lastName: currentUser?.lastName ?? 'N/A'
        }}
        validationSchema={$UpdateUserFormData}
        onSubmit={(data) => {
          void updateUserMutation.mutateAsync({ data: data, id: currentUser!.id });
        }}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/user')({
  component: RouteComponent
});
