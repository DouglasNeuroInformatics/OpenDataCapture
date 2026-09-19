import React, { useMemo, useState } from 'react';

import type { ZodErrorLike } from '@douglasneuroinformatics/libjs';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Button, Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { User } from '@opendatacapture/schemas/user';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';
import type { PasswordFormValues } from '@/hooks/usePasswordGenerator';
import { $Email, $PhoneNumber, requiresGroup } from '@/utils/validation';

type UpdateUserFormData = {
  confirmPassword?: string | undefined;
  disabled?: boolean;
  email?: string | undefined;
  groupIds: Set<string>;
  password?: string | undefined;
  phoneNumber?: string | undefined;
};

/**
 * `mustResetPassword` is not a form field — it is derived at submission from whether the password
 * being saved is the generated one, so it is carried alongside the form data rather than in it.
 */
type UpdateUserSubmitData = UpdateUserFormData & {
  mustResetPassword?: boolean;
};

type UpdateUserFormInputData = {
  disableDelete: boolean;
  groupOptions: {
    [id: string]: string;
  };
  initialValues?: FormTypes.PartialNullableData<UpdateUserFormData>;
  selectedUserBasePermission?: User['basePermissionLevel'];
};

type UpdateUserFormProps = {
  data: UpdateUserFormInputData;
  onDelete: () => void;
  onError: (error: ZodErrorLike) => void;
  onSubmit: (data: UpdateUserSubmitData) => Promisable<void>;
};

export const UpdateUserForm = ({ data, onDelete, onError, onSubmit }: UpdateUserFormProps) => {
  const { disableDelete, groupOptions, initialValues } = data;
  const { resolvedLanguage, t } = useTranslation();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const { applyGeneratedPassword, generatedPassword, generatePassword, isGeneratedPassword } = usePasswordGenerator();

  const $UpdateUserFormData = useMemo(() => {
    return z
      .object({
        confirmPassword: z.string().min(1).optional(),
        disabled: z.boolean().optional(),
        email: $Email(t).optional(),
        groupIds: z.set(z.string()),
        password: z.string().min(1).optional(),
        phoneNumber: $PhoneNumber(t, initialValues?.phoneNumber).optional()
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
        const permissions = { basePermissionLevel: data.selectedUserBasePermission, disabled: ctx.value.disabled };
        if (requiresGroup(permissions) && ctx.value.groupIds.size <= 0) {
          ctx.issues.push({
            code: 'custom',
            input: ctx.value.groupIds,
            message: t('common.groupRequired'),
            path: ['groupIds']
          });
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
    // `selectedUserBasePermission` decides whether a group is required, so a schema built for the
    // previously selected user must not be reused: two users differing only in permission level
    // would otherwise share one schema and be validated against the wrong rule.
  }, [data.selectedUserBasePermission, resolvedLanguage, initialValues?.phoneNumber]);

  return (
    <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
      <Form
        additionalButtons={{
          left: (
            <Dialog.Trigger asChild>
              <Button className="w-full" disabled={disableDelete} type="button" variant="danger">
                {t('core.delete')}
              </Button>
            </Dialog.Trigger>
          )
        }}
        content={[
          {
            fields: {
              password: {
                calculateStrength: (password) => {
                  return estimatePasswordStrength(password).score;
                },
                generatePassword,
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
              en: 'Update Contact Information',
              fr: 'Mettre à jour les coordonnées'
            })
          },
          {
            fields: {
              disabled: {
                description: t({
                  en: 'Use this option if the user is not intended to log in, for example, when the account is used solely to identify the author of uploaded data.',
                  fr: 'Utilisez cette option si l’utilisateur n’a pas vocation à se connecter, par exemple lorsque le compte sert uniquement à identifier l’auteur de données téléversées.'
                }),
                kind: 'boolean',
                label: t({
                  en: 'Disabled',
                  fr: 'Désactivé'
                }),
                variant: 'radio'
              }
            },
            title: t({
              en: 'Account Status',
              fr: 'État du compte'
            })
          },
          {
            fields: {
              groupIds: {
                kind: 'set',
                label: 'Group IDs',
                options: groupOptions,
                variant: 'listbox'
              }
            },
            title: t({
              en: 'Groups',
              fr: 'Groupes'
            })
          }
        ]}
        data-testid="update-user-form"
        initialValues={{
          ...initialValues,
          disabled: initialValues?.disabled ?? false
        }}
        key={JSON.stringify(initialValues)}
        submitBtnLabel={t('core.save')}
        subscribe={{
          // Annotated because libui's `FormProps` leaves `TData` uninstantiated in this one
          // position, so `setValues` is inferred as an error type rather than a setter.
          onChange: (_, setValues: React.Dispatch<React.SetStateAction<PasswordFormValues>>) =>
            applyGeneratedPassword(setValues),
          selector: () => generatedPassword
        }}
        validationSchema={$UpdateUserFormData}
        onError={onError}
        onSubmit={(data) =>
          onSubmit({
            ...data,
            // Left undefined when the password field is blank, so saving other changes to a user who
            // still owes a reset does not quietly lift it.
            mustResetPassword: data.password ? isGeneratedPassword(data.password) : undefined
          })
        }
      />
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            {t({
              en: 'Are you absolutely sure?',
              fr: 'Êtes-vous absolument sûr ?'
            })}
          </Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'This action will permanently delete the account and cannot be undone.',
              fr: 'Cette action supprimera définitivement le compte et ne pourra pas être annulée.'
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button className="min-w-16" type="button" variant="danger" onClick={onDelete}>
            {t('core.yes')}
          </Button>
          <Button className="min-w-16" type="button" variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
            {t('core.no')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

export type { UpdateUserFormInputData, UpdateUserSubmitData };
