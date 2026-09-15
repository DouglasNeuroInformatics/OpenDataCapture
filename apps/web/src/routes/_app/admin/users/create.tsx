/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, CopyButton, Dialog, Form, Heading, Label } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import { $BasePermissionLevel, $CreateUserData } from '@opendatacapture/schemas/user';
import type { CreateUserData } from '@opendatacapture/schemas/user';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { z } from 'zod/v4';

import { LanguageSelect } from '@/components/LanguageSelect';
import { PageHeader } from '@/components/PageHeader';
import { useCreateUserMutation } from '@/hooks/useCreateUserMutation';
import { groupsQueryOptions, useGroupsQuery } from '@/hooks/useGroupsQuery';
import { useMailErrorMessage } from '@/hooks/useMailErrorMessage';
import { usePasswordErrorMessage } from '@/hooks/usePasswordErrorMessage';
import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';
import type { PasswordFormValues } from '@/hooks/usePasswordGenerator';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { $Email, $PhoneNumber, omittedIfBlank, requiresGroup } from '@/utils/validation';

const RouteComponent = () => {
  const { resolvedLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const groupsQuery = useGroupsQuery();
  const createUserMutation = useCreateUserMutation();
  const notification = useNotificationsStore();
  const setupStateQuery = useSetupStateQuery();
  const mailErrorMessage = useMailErrorMessage();
  const passwordErrorMessage = usePasswordErrorMessage();
  const { applyGeneratedPassword, generatePassword, generatedPassword, isGeneratedPassword } = usePasswordGenerator();

  // When the welcome email cannot be delivered, we surface its rendered text here so
  // the admin can copy it and send it manually. Navigation is deferred until dismissed.
  const [fallbackMessage, setFallbackMessage] = React.useState<null | string>(null);
  const [emailLanguage, setEmailLanguage] = React.useState<Language>(resolvedLanguage);

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

    const createUserFailedMessage = t({
      en: 'Failed to create user',
      fr: "Échec de la création de l'utilisateur"
    });

    let created;
    try {
      created = await createUserMutation.mutateAsync({ data, language: emailLanguage });
    } catch (err) {
      notification.addNotification({
        message: passwordErrorMessage(err, createUserFailedMessage),
        type: 'error'
      });
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
            message: mailErrorMessage(welcomeEmail.error),
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
    notification.addNotification({ type: 'success' });
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
          <LanguageSelect data-testid="welcome-email-language" value={emailLanguage} onChange={setEmailLanguage} />
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
                generatePassword,
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
        data-testid="create-user-form"
        initialValues={{
          disabled: false
        }}
        subscribe={{
          // Annotated because libui's `FormProps` leaves `TData` uninstantiated in this one
          // position, so `setValues` is inferred as an error type rather than a setter.
          onChange: (_, setValues: React.Dispatch<React.SetStateAction<PasswordFormValues>>) =>
            applyGeneratedPassword(setValues),
          selector: () => generatedPassword
        }}
        validationSchema={$CreateUserData
          .omit({
            groupIds: true
          })
          .extend({
            basePermissionLevel: $BasePermissionLevel,
            groupIds: z.set(z.string()).optional(),
            confirmPassword: z.string().min(1),
            email: $Email(t).optional(),
            phoneNumber: $PhoneNumber(t).optional()
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
          })
          .check((ctx) => {
            if (requiresGroup(ctx.value) && !ctx.value.groupIds?.size) {
              ctx.issues.push({
                code: 'custom',
                input: ctx.value.groupIds,
                message: t('common.groupRequired'),
                path: ['groupIds']
              });
            }
          })}
        onSubmit={({ email, groupIds, phoneNumber, ...data }) =>
          handleSubmit({
            ...data,
            email: omittedIfBlank(email),
            groupIds: Array.from(groupIds ?? []),
            mustResetPassword: isGeneratedPassword(data.password),
            phoneNumber: omittedIfBlank(phoneNumber)
          })
        }
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
        <Dialog.Content className="max-w-lg" data-testid="welcome-email-fallback">
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
