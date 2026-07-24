/* eslint-disable perfectionist/sort-objects */
import { useMemo, useState } from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, Card, Dialog, Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Sex } from '@opendatacapture/schemas/subject';
import { createFileRoute } from '@tanstack/react-router';
import { KeyRoundIcon } from 'lucide-react';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { UserIcon } from '@/components/UserIcon';
import { useFindUserQuery } from '@/hooks/useFindUserQuery';
import { useSelfUpdateUserMutation } from '@/hooks/useSelfUpdateUserMutation';
import { useAppStore } from '@/store';
import { countPhoneDigits, MIN_PHONE_DIGITS, PHONE_REGEX } from '@/utils/validation';

type ProfileFormData = {
  dateOfBirth?: Date | undefined;
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  phoneNumber?: string | undefined;
  sex?: undefined | z.infer<typeof $Sex>;
};

type PasswordFormData = {
  confirmPassword: string;
  password: string;
};

const RouteComponent = () => {
  const currentUser = useAppStore((store) => store.currentUser);
  const updateSelfUserMutation = useSelfUpdateUserMutation();
  const { resolvedLanguage, t } = useTranslation();
  const userInfo = useFindUserQuery(currentUser!.id);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const permissionLabels: { [key: string]: string } = {
    ADMIN: t({ en: 'Admin', fr: 'Admin' }),
    GROUP_MANAGER: t({ en: 'Group Manager', fr: 'Responsable de groupe' }),
    STANDARD: t({ en: 'Standard User', fr: 'Utilisateur standard' })
  };

  const permissionLevel =
    typeof userInfo.data.basePermissionLevel === 'string'
      ? permissionLabels[userInfo.data.basePermissionLevel]
      : undefined;

  const $ProfileFormData = useMemo(() => {
    return z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      dateOfBirth: z.date().optional(),
      sex: $Sex.optional(),
      email: z.union([z.literal(''), z.email()]).optional(),
      phoneNumber: z
        .union([
          z.literal(''),
          z
            .string()
            .regex(PHONE_REGEX)
            .check((ctx) => {
              if (countPhoneDigits(ctx.value) < MIN_PHONE_DIGITS) {
                ctx.issues.push({
                  code: 'custom',
                  input: ctx.value,
                  message: t({
                    en: `Phone number must contain at least ${MIN_PHONE_DIGITS} digits`,
                    fr: `Le numéro de téléphone doit contenir au moins ${MIN_PHONE_DIGITS} chiffres`
                  })
                });
              }
            })
        ])
        .optional()
    }) satisfies z.ZodType<ProfileFormData>;
  }, [resolvedLanguage]);

  const $PasswordFormData = useMemo(() => {
    return z
      .object({
        password: z.string().min(1),
        confirmPassword: z.string().min(1)
      })
      .check((ctx) => {
        if (!estimatePasswordStrength(ctx.value.password).success) {
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
      }) satisfies z.ZodType<PasswordFormData>;
  }, [resolvedLanguage]);

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({ en: 'Account', fr: 'Compte' })}
        </Heading>
      </PageHeader>
      <Card className="mx-auto mt-4 max-w-3xl">
        <Card.Header className="flex-row items-center justify-between py-[0.633rem]">
          <div className="flex items-center gap-3">
            <UserIcon className="h-18 w-18" />
            <div>
              <Card.Title className="text-lg">{currentUser?.username}</Card.Title>
              {permissionLevel && (
                <p className="text-muted-foreground text-base">
                  {t({ en: 'Role', fr: 'Rôle' })}: {permissionLevel}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="flex w-60 items-center justify-center gap-2 bg-sky-700 text-white hover:bg-sky-800"
              type="button"
              variant="primary"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              <KeyRoundIcon className="h-4 w-4" />
              {t({ en: 'Change Password', fr: 'Changer le mot de passe' })}
            </Button>
          </div>
        </Card.Header>
      </Card>
      <Form
        className="mx-auto mt-6 max-w-3xl"
        content={[
          {
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
              dateOfBirth: {
                kind: 'date',
                label: t('core.identificationData.dateOfBirth.label')
              },
              sex: {
                kind: 'string',
                label: t('core.identificationData.sex.label'),
                options: {
                  FEMALE: t('core.identificationData.sex.female'),
                  MALE: t('core.identificationData.sex.male')
                },
                variant: 'select'
              },
              email: {
                kind: 'string',
                label: t({ en: 'Email', fr: 'Courriel' }),
                variant: 'input'
              },
              phoneNumber: {
                kind: 'string',
                label: t({ en: 'Phone Number', fr: 'Numéro de téléphone' }),
                variant: 'input'
              }
            },
            title: t({
              en: 'Personal Information',
              fr: 'Informations personnelles'
            })
          }
        ]}
        data-form-type="other"
        data-lpignore="true"
        initialValues={{
          firstName: userInfo.data.firstName ?? '',
          lastName: userInfo.data.lastName ?? '',
          dateOfBirth: userInfo.data.dateOfBirth ?? undefined,
          sex: userInfo.data.sex ?? undefined,
          email: userInfo.data.email ?? '',
          phoneNumber: userInfo.data.phoneNumber ?? ''
        }}
        key={userInfo.dataUpdatedAt}
        submitBtnLabel={t({ en: 'Save', fr: 'Enregistrer' })}
        validationSchema={$ProfileFormData}
        onSubmit={(data) => {
          const filteredData = Object.fromEntries(
            Object.entries(data).filter(([, value]) => value != null && value !== '')
          );
          void updateSelfUserMutation.mutateAsync({
            data: filteredData,
            id: currentUser!.id
          });
        }}
      />
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Change Password', fr: 'Changer le mot de passe' })}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Form
              content={{
                password: {
                  calculateStrength: (password) => estimatePasswordStrength(password).score,
                  kind: 'string',
                  label: t('common.password'),
                  variant: 'password'
                },
                confirmPassword: {
                  kind: 'string',
                  label: t('common.confirmPassword'),
                  variant: 'password'
                }
              }}
              data-form-type="other"
              data-lpignore="true"
              submitBtnLabel={t({ en: 'Save', fr: 'Enregistrer' })}
              validationSchema={$PasswordFormData}
              onSubmit={(data) => {
                void updateSelfUserMutation
                  .mutateAsync({
                    data: { password: data.password },
                    id: currentUser!.id
                  })
                  .then(() => setIsPasswordDialogOpen(false));
              }}
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export const Route = createFileRoute('/_app/user')({
  component: RouteComponent
});
