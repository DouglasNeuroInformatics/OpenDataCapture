/* eslint-disable perfectionist/sort-objects */
import { useMemo, useState } from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, Card, Dialog, Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $Sex } from '@opendatacapture/schemas/subject';
import type { BasePermissionLevel } from '@opendatacapture/schemas/user';
import { createFileRoute } from '@tanstack/react-router';
import { KeyRoundIcon } from 'lucide-react';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { UserIcon } from '@/components/UserIcon';
import { useFindUserQuery } from '@/hooks/useFindUserQuery';
import { useSelfUpdateUserMutation } from '@/hooks/useSelfUpdateUserMutation';
import { useAppStore } from '@/store';
import { $Email, $PhoneNumber, clearedIfBlank, omittedIfUnchanged } from '@/utils/validation';

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

  const permissionLabels: { [K in BasePermissionLevel]: string } = {
    ADMIN: t({ en: 'Admin', fr: 'Admin' }),
    GROUP_MANAGER: t({ en: 'Group Manager', fr: 'Responsable de groupe' }),
    STANDARD: t({ en: 'Standard User', fr: 'Utilisateur standard' })
  };

  const permissionLevel = userInfo.data.basePermissionLevel
    ? permissionLabels[userInfo.data.basePermissionLevel]
    : undefined;

  const $ProfileFormData = useMemo(() => {
    return z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      dateOfBirth: z.date().optional(),
      sex: $Sex.optional(),
      email: $Email(t).optional(),
      phoneNumber: $PhoneNumber(t, userInfo.data.phoneNumber).optional()
    }) satisfies z.ZodType<ProfileFormData>;
  }, [resolvedLanguage, userInfo.data.phoneNumber]);

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
          {t('user.account')}
        </Heading>
      </PageHeader>
      <Card className="mx-auto mt-4 max-w-3xl">
        <Card.Header className="flex-row items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <UserIcon className="h-18 w-18" />
            <div>
              <Card.Title className="text-lg" data-testid="user-info-username">
                {currentUser?.username}
              </Card.Title>
              {permissionLevel && (
                <p className="text-muted-foreground text-base" data-testid="user-info-role">
                  {t({ en: 'Role', fr: 'Rôle' })}: {permissionLevel}
                </p>
              )}
            </div>
          </div>
          <Button className="gap-2" type="button" variant="primary" onClick={() => setIsPasswordDialogOpen(true)}>
            <KeyRoundIcon className="h-4 w-4" />
            {t('user.changePassword')}
          </Button>
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
                label: t('common.email'),
                variant: 'input'
              },
              phoneNumber: {
                kind: 'string',
                label: t('common.phoneNumber'),
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
        data-testid="profile-form"
        initialValues={{
          firstName: userInfo.data.firstName ?? '',
          lastName: userInfo.data.lastName ?? '',
          dateOfBirth: userInfo.data.dateOfBirth ?? undefined,
          sex: userInfo.data.sex ?? undefined,
          email: userInfo.data.email ?? '',
          phoneNumber: userInfo.data.phoneNumber ?? ''
        }}
        key={userInfo.dataUpdatedAt}
        submitBtnLabel={t('core.save')}
        validationSchema={$ProfileFormData}
        onSubmit={({ email, phoneNumber, ...rest }) => {
          updateSelfUserMutation.mutate({
            data: {
              ...rest,
              email: clearedIfBlank(email),
              phoneNumber: omittedIfUnchanged(phoneNumber, userInfo.data.phoneNumber)
            },
            id: currentUser!.id
          });
        }}
      />
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t('user.changePassword')}</Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'Enter a new password for your account, then confirm it to save the change.',
                fr: 'Saisissez un nouveau mot de passe pour votre compte, puis confirmez-le pour enregistrer la modification.'
              })}
            </Dialog.Description>
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
              submitBtnLabel={t('core.save')}
              validationSchema={$PasswordFormData}
              onSubmit={(data) => {
                updateSelfUserMutation.mutate(
                  { data: { password: data.password }, id: currentUser!.id },
                  { onSuccess: () => setIsPasswordDialogOpen(false) }
                );
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
