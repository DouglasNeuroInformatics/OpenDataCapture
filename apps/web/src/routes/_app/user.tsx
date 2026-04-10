import { useMemo } from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Sex } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { UserIcon } from '@/components/UserIcon';
import { useFindUserQuery } from '@/hooks/useFindUserQuery';
import { useUpdateUserMutation } from '@/hooks/useUpdateUserMutation';
import { useAppStore } from '@/store';

type UpdateUserFormData = {
  confirmPassword?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  password?: string | undefined;
};

const phoneRegex = new RegExp(/^\+?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/);

const RouteComponent = () => {
  const currentUser = useAppStore((store) => store.currentUser);

  const updateUserMutation = useUpdateUserMutation();
  const { resolvedLanguage, t } = useTranslation();
  const userInfo = useFindUserQuery(currentUser!.id);

  let fullName: string;
  if (userInfo.data.firstName && userInfo.data.lastName) {
    fullName = `${userInfo.data.firstName} ${userInfo.data.lastName}`;
  } else if (userInfo.data.firstName) {
    fullName = userInfo.data.firstName;
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
        email: z.email().optional(),
        phoneNumber: z.string().regex(phoneRegex).optional(),
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
        key={userInfo.dataUpdatedAt}
        className="mx-auto max-w-3xl"
        content={[
          {
            fields: {
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
              },
              email: {
                kind: 'string',
                label: t({
                  en: 'Email',
                  fr: 'Courriel'
                }),
                variant: 'input'
              },
              phoneNumber: {
                kind: 'string',
                label: t({
                  en: 'Phone Number',
                  fr: 'Numéro de téléphone'
                }),
                variant: 'input'
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
          dateOfBirth: userInfo.data.dateOfBirth ?? undefined,
          firstName: userInfo.data.firstName ?? '',
          lastName: userInfo.data.lastName ?? '',
          sex: userInfo.data.sex ?? undefined
        }}
        validationSchema={$UpdateUserFormData}
        onSubmit={(data) => {
          void updateUserMutation.mutateAsync({
            data: { groupIds: Array.from(userInfo.data.groupIds), ...data },
            id: currentUser!.id
          });
        }}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/user')({
  component: RouteComponent
});
