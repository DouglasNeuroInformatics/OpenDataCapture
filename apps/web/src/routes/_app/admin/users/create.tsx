/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, CopyButton, Dialog, Form, Heading, Label, Select } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $MailLanguage } from '@opendatacapture/schemas/mail';
import type { MailLanguage } from '@opendatacapture/schemas/mail';
import { $BasePermissionLevel, $CreateUserData, PASSWORD_ERROR_CODES } from '@opendatacapture/schemas/user';
import type { CreateUserData, PasswordErrorCode } from '@opendatacapture/schemas/user';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios, { isAxiosError } from 'axios';
import { z } from 'zod/v4';

import { PageHeader } from '@/components/PageHeader';
import { useCreateUserMutation } from '@/hooks/useCreateUserMutation';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { ALL_LANGUAGES } from '@/utils/languages';
import { PHONE_REGEX } from '@/utils/validation';

const PASSWORD_ERROR_TRANSLATION_KEYS = {
  INSUFFICIENT_PASSWORD_STRENGTH: 'common.insufficientPasswordStrength',
  PASSWORD_IN_DATA_BREACH: 'common.passwordInDataBreach',
  PASSWORD_MATCHES_USERNAME: 'common.passwordMatchesUsername'
} as const satisfies { [code in PasswordErrorCode]: string };

function parsePasswordErrorCode(data: unknown): null | PasswordErrorCode {
  if (typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string') {
    return (PASSWORD_ERROR_CODES as readonly string[]).includes(data.code) ? (data.code as PasswordErrorCode) : null;
  }
  return null;
}

const RouteComponent = () => {
  const { resolvedLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const groupsQuery = useGroupsQuery();
  const createUserMutation = useCreateUserMutation();
  const notification = useNotificationsStore();
  const setupStateQuery = useSetupStateQuery();

  // When the welcome email cannot be delivered, we surface its rendered text here so
  // the admin can copy it and send it manually. Navigation is deferred until dismissed.
  const [fallbackMessage, setFallbackMessage] = React.useState<null | string>(null);
  const activeLanguages = setupStateQuery.data.activeLanguages ?? ['en', 'fr'];
  const [emailLanguage, setEmailLanguage] = React.useState<MailLanguage>(() =>
    $MailLanguage.parse(activeLanguages.includes(resolvedLanguage) ? resolvedLanguage : (activeLanguages[0] ?? 'en'))
  );

  const handleSubmit = async (data: CreateUserData) => {
    // check if username exists
    const existingUsername = await axios.get<{ success: boolean }>(
      `/v1/users/check-username/${encodeURIComponent(data.username)}`
    );

    if (existingUsername.data.success === true) {
      notification.addNotification({
        type: 'error',
        message: t('common.usernameExists')
      });
      return;
    }

    let created;
    try {
      created = await createUserMutation.mutateAsync({ data, language: emailLanguage });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        const code = parsePasswordErrorCode(err.response.data);
        notification.addNotification({
          message: code
            ? t(PASSWORD_ERROR_TRANSLATION_KEYS[code])
            : t({
                en: 'Failed to create user',
                fr: "Échec de la création de l'utilisateur"
              }),
          type: 'error'
        });
      } else {
        notification.addNotification({
          message: t({
            en: 'Failed to create user',
            fr: "Échec de la création de l'utilisateur"
          }),
          type: 'error'
        });
      }
      return;
    }
    const welcomeEmail = created.welcomeEmail;

    // Only surface email outcomes when mail is enabled; otherwise behave exactly as before.
    if (setupStateQuery.data.isMailEnabled && welcomeEmail) {
      if (welcomeEmail.status === 'SENT') {
        notification.addNotification({
          message: t({
            en: `A welcome email was sent to ${welcomeEmail.recipient ?? ''}`,
            fr: `Un courriel de bienvenue a été envoyé à ${welcomeEmail.recipient ?? ''}`
          }),
          title: t({
            en: 'Welcome email sent',
            fr: 'Courriel de bienvenue envoyé'
          }),
          type: 'success'
        });
        void navigate({ to: '..' });
        return;
      }
      if (welcomeEmail.status === 'FAILED' || welcomeEmail.status === 'NO_RECIPIENT') {
        if (welcomeEmail.status === 'FAILED') {
          notification.addNotification({
            message:
              welcomeEmail.error ??
              t({
                en: 'The welcome email could not be sent',
                fr: "Le courriel de bienvenue n'a pas pu être envoyé"
              }),
            title: t({
              en: 'Welcome email failed',
              fr: 'Échec du courriel de bienvenue'
            }),
            type: 'error'
          });
        }
        setFallbackMessage(welcomeEmail.message);
        return;
      }
    }
    void navigate({ to: '..' });
  };

  return (
    <div>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Add User',
            fr: 'Ajouter un utilisateur'
          })}
        </Heading>
      </PageHeader>
      {setupStateQuery.data.isMailEnabled && (
        <div className="mx-auto mb-6 flex max-w-3xl flex-col gap-1.5">
          <Label>
            {t({
              en: 'Welcome email language',
              fr: 'Langue du courriel de bienvenue'
            })}
          </Label>
          <Select value={emailLanguage} onValueChange={(v) => setEmailLanguage($MailLanguage.parse(v))}>
            <Select.Trigger className="w-[180px]">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {activeLanguages.map((code) => (
                  <Select.Item key={code} value={code}>
                    {ALL_LANGUAGES[code] ?? code}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
        </div>
      )}
      <Form
        className="mx-auto max-w-3xl"
        content={[
          {
            fields: {
              username: {
                kind: 'string',
                label: t('common.username'),
                variant: 'input'
              },
              password: {
                calculateStrength: (password) => {
                  return estimatePasswordStrength(password).score;
                },
                kind: 'string',
                label: t('common.password'),
                variant: 'password'
              },
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
              en: 'Contact information',
              fr: 'Coordonnées'
            })
          },
          {
            title: t({
              en: 'Permissions',
              fr: 'Autorisations'
            }),
            fields: {
              basePermissionLevel: {
                kind: 'string',
                label: t('common.basePermissionLevel'),
                options: {
                  ADMIN: t('common.admin'),
                  GROUP_MANAGER: t('common.groupManager'),
                  STANDARD: t('common.standard')
                },
                variant: 'select'
              },
              disabled: {
                kind: 'boolean',
                description: t({
                  en: 'Use this option if the user is not intended to log in, for example, when the account is used solely to identify the author of uploaded data.',
                  fr: "Utilisez cette option si l'utilisateur n'a pas vocation à se connecter, par exemple lorsque le compte sert uniquement à identifier l'auteur de données téléversées."
                }),
                label: t({
                  en: 'Disabled',
                  fr: 'Désactivé'
                }),
                variant: 'radio'
              },
              groupIds: {
                kind: 'dynamic',
                deps: ['basePermissionLevel'],
                render({ basePermissionLevel }) {
                  if (!basePermissionLevel || basePermissionLevel === 'ADMIN') {
                    return null;
                  }
                  return {
                    kind: 'set',
                    label: t('common.groups'),
                    options: Object.fromEntries((groupsQuery.data ?? []).map((group) => [group.id, group.name])),
                    variant: 'listbox'
                  };
                }
              }
            }
          },
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
              sex: {
                kind: 'string',
                label: t('core.identificationData.sex.label'),
                options: {
                  MALE: t('core.identificationData.sex.male'),
                  FEMALE: t('core.identificationData.sex.female')
                },
                variant: 'select'
              },
              dateOfBirth: {
                kind: 'date',
                label: t('core.identificationData.dateOfBirth.label')
              }
            },
            title: t({
              en: 'Additional Information',
              fr: 'Informations supplémentaires'
            })
          }
        ]}
        initialValues={{
          disabled: false
        }}
        validationSchema={$CreateUserData
          .omit({
            groupIds: true
          })
          .extend({
            basePermissionLevel: $BasePermissionLevel,
            groupIds: z.set(z.string()).optional(),
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
            if (ctx.value.password.toLowerCase() === ctx.value.username.toLowerCase()) {
              ctx.issues.push({
                code: 'custom',
                fatal: true,
                input: ctx.value.password,
                message: t('common.passwordMatchesUsername'),
                path: ['password']
              });
              return z.NEVER;
            }
            if (ctx.value.confirmPassword !== ctx.value.password) {
              ctx.issues.push({
                code: 'custom',
                input: ctx.value.confirmPassword,
                message: t('common.passwordsMustMatch'),
                path: ['confirmPassword']
              });
            }
            if (ctx.value.phoneNumber && !PHONE_REGEX.test(ctx.value.phoneNumber)) {
              ctx.issues.push({
                code: 'custom',
                input: ctx.value.phoneNumber,
                message: t({
                  en: 'Invalid Phone number',
                  fr: 'Numéro de téléphone invalide'
                }),
                path: ['phoneNumber']
              });
            }
          })}
        onSubmit={(data) => handleSubmit({ ...data, groupIds: Array.from(data.groupIds ?? []) })}
      />
      <Dialog
        open={fallbackMessage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFallbackMessage(null);
            void navigate({ to: '..' });
          }
        }}
      >
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>{t({ en: 'Welcome message', fr: 'Message de bienvenue' })}</Dialog.Title>
            <Dialog.Description>
              {t({
                en: 'The welcome email could not be delivered automatically. Copy the message below and send it to the user manually.',
                fr: "Le courriel de bienvenue n'a pas pu être livré automatiquement. Copiez le message ci-dessous et envoyez-le manuellement à l'utilisateur."
              })}
            </Dialog.Description>
          </Dialog.Header>
          <pre className="bg-muted max-h-72 overflow-auto whitespace-pre-wrap rounded-md p-4 text-sm">
            {fallbackMessage}
          </pre>
          <Dialog.Footer>
            <CopyButton size="md" text={fallbackMessage ?? ''} variant="outline" />
            <Button
              type="button"
              onClick={() => {
                setFallbackMessage(null);
                void navigate({ to: '..' });
              }}
            >
              {t({ en: 'Done', fr: 'Terminé' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export const Route = createFileRoute('/_app/admin/users/create')({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions())
});
