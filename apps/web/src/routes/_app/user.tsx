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
import { useSelfUpdateUserMutation } from '@/hooks/useSelfUpdateUserMutation';
import { useAppStore } from '@/store';
import { PHONE_REGEX } from '@/utils/validation';

type UpdateUserFormData = {
  confirmPassword?: string | undefined;
  dateOfBirth?: Date | undefined;
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  password?: string | undefined;
  phoneNumber?: string | undefined;
  sex?: undefined | z.infer<typeof $Sex>;
};

const RouteComponent = () => {
  const currentUser = useAppStore((store) => store.currentUser);

  const updateSelfUserMutation = useSelfUpdateUserMutation();
  const { resolvedLanguage, t } = useTranslation();
  const userInfo = useFindUserQuery(currentUser!.id);

  const userType: { [key: string]: string } = {
    ADMIN: t({
      en: 'Admin',
      fr: 'Admin'
    }),
    GROUP_MANAGER: t({
      en: 'Group Manager',
      fr: 'Responsable de groupe'
    }),
    STANDARD: t({
      en: 'Standard User',
      fr: 'Utilisateur standard'
    })
  };

  const userTypes = ['ADMIN', 'GROUP_MANAGER', 'STANDARD'];

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
        email: z.union([z.literal(''), z.email()]).optional(),
        firstName: z.string().min(1).optional(),
        // eslint-disable-next-line perfectionist/sort-objects
        dateOfBirth: z.date().optional(),
        lastName: z.string().min(1).optional(),
        // eslint-disable-next-line perfectionist/sort-objects
        confirmPassword: z.string().min(1).optional(),
        password: z.string().min(1).optional(),
        phoneNumber: z.union([z.literal(''), z.string().regex(PHONE_REGEX)]).optional(),
        sex: $Sex.optional()
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
        <p className="text-sm">
          {userTypes.includes(userInfo.data.basePermissionLevel as string)
            ? userType[userInfo.data.basePermissionLevel as string]
            : undefined}
        </p>
      </div>
      <Form
        className="mx-auto max-w-3xl"
        content={[
          {
            fields: {
              confirmPassword: {
                kind: 'string',
                label: t('common.confirmPassword'),
                variant: 'password'
              },
              password: {
                calculateStrength: (password) => {
                  return estimatePasswordStrength(password).score;
                },
                kind: 'string',
                label: t('common.password'),
                variant: 'password'
              },
              // eslint-disable-next-line perfectionist/sort-objects
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
              fr: 'Informations personnelles'
            })
          }
        ]}
        initialValues={{
          dateOfBirth: userInfo.data.dateOfBirth ?? undefined,
          email: userInfo.data.email ?? '',
          firstName: userInfo.data.firstName ?? '',
          lastName: userInfo.data.lastName ?? '',
          phoneNumber: userInfo.data.phoneNumber ?? '',
          sex: userInfo.data.sex ?? undefined
        }}
        key={userInfo.dataUpdatedAt}
        validationSchema={$UpdateUserFormData}
        onSubmit={(data) => {
          const { confirmPassword, password, ...restData } = data;
          const filteredData = Object.fromEntries(
            Object.entries(restData).filter(([, value]) => value != null && value !== '')
          );

          void updateSelfUserMutation.mutateAsync({
            data: {
              ...filteredData,
              ...(password && password === confirmPassword ? { password } : {})
            },
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
