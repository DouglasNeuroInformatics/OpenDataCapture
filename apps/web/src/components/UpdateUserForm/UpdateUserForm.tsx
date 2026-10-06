import React, { useMemo } from 'react';

import type { ZodErrorLike } from '@douglasneuroinformatics/libjs';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Form } from '@douglasneuroinformatics/libui/components';
import type { FormProps } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { User } from '@opendatacapture/schemas/user';
import { z } from 'zod/v4';

import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';
import type { PasswordFormValues } from '@/hooks/usePasswordGenerator';
import { useSuppressPasswordAutofill } from '@/hooks/useSuppressPasswordAutofill';
import { $Email, $OptionalPassword, $PhoneNumber, requiresGroup } from '@/utils/validation';

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
  groupOptions: {
    [id: string]: string;
  };
  initialValues: FormTypes.PartialNullableData<UpdateUserFormData>;
  selectedUserBasePermission?: User['basePermissionLevel'];
};

type UpdateUserFormProps = {
  data: UpdateUserFormInputData;
  id?: string;
  onError: (error: ZodErrorLike) => void;
  onSubmit: FormProps<z.ZodType<UpdateUserSubmitData>>['onSubmit'];
};

export const UpdateUserForm = ({ data, id, onError, onSubmit }: UpdateUserFormProps) => {
  const { groupOptions, initialValues } = data;
  const { resolvedLanguage, t } = useTranslation();
  const { applyGeneratedPassword, generatedPassword, generatePassword, isGeneratedPassword } = usePasswordGenerator();
  const suppressPasswordAutofill = useSuppressPasswordAutofill();

  const $UpdateUserFormData = useMemo(() => {
    return z
      .object({
        confirmPassword: $OptionalPassword,
        disabled: z.boolean().optional(),
        email: $Email(t).optional(),
        groupIds: z.set(z.string()),
        password: $OptionalPassword,
        phoneNumber: $PhoneNumber(t, initialValues.phoneNumber).optional()
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
  }, [data.selectedUserBasePermission, resolvedLanguage, initialValues.phoneNumber]);

  return (
    <div className="contents" key={JSON.stringify(initialValues)} ref={suppressPasswordAutofill}>
      {/* libui always renders a boolean radio's `true` option first, so the row is reversed to lead with Enabled. */}
      <Form
        className="[&_[role=radiogroup]:has(#disabled-true)]:flex [&_[role=radiogroup]:has(#disabled-true)]:flex-row-reverse [&_[role=radiogroup]:has(#disabled-true)]:justify-end [&_[role=radiogroup]:has(#disabled-true)]:gap-6 [&_[role=radiogroup]:has(#disabled-true)]:pt-2 [&>div:has(#disabled-true)]:gap-2"
        content={[
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
              en: 'Contact',
              es: 'Contacto',
              fr: 'Coordonnées'
            })
          },
          {
            description: t({
              en: 'A permission scoped to a group is dropped when the user leaves that group.',
              es: 'Un permiso limitado a un grupo se retira cuando el usuario deja ese grupo.',
              fr: "Une autorisation limitée à un groupe est retirée lorsque l'utilisateur quitte ce groupe."
            }),
            fields: {
              groupIds: {
                kind: 'set',
                label: t({ en: 'Member Of', es: 'Miembro de', fr: 'Membre de' }),
                options: groupOptions,
                variant: 'listbox'
              }
            },
            title: t('common.groups')
          },
          {
            fields: {
              disabled: {
                description: t({
                  en: 'This option should be set to Disabled if the user is not intended to log in, for example, when the account is used solely to identify the author of uploaded data.',
                  es: 'Esta opción debe establecerse en Desactivado si el usuario no debe iniciar sesión, por ejemplo, cuando la cuenta solo sirve para identificar al autor de los datos cargados.',
                  fr: 'Cette option doit être réglée sur Désactivé si l’utilisateur n’a pas vocation à se connecter, par exemple lorsque le compte sert uniquement à identifier l’auteur de données téléversées.'
                }),
                kind: 'boolean',
                label: t({
                  en: 'Status',
                  es: 'Estado',
                  fr: 'Statut'
                }),
                options: {
                  false: t({ en: 'Enabled', es: 'Activado', fr: 'Activé' }),
                  true: t({ en: 'Disabled', es: 'Desactivado', fr: 'Désactivé' })
                },
                variant: 'radio'
              }
            }
          },
          {
            description: t({
              en: 'Leave blank to keep the current password.',
              es: 'Deje el campo en blanco para conservar la contraseña actual.',
              fr: 'Laissez vide pour conserver le mot de passe actuel.'
            }),
            fields: {
              // No `calculateStrength`: libui renders the strength meter whenever that is given, and
              // scores a blank field zero — painting red a field that is legitimately blank whenever
              // the password is being left alone. Strength is still enforced above, on a password
              // actually being set.
              password: {
                generatePassword,
                kind: 'string',
                label: t({
                  en: 'Set new password',
                  es: 'Definir una nueva contraseña',
                  fr: 'Définir un nouveau mot de passe'
                }),
                variant: 'password'
              },
              // eslint-disable-next-line perfectionist/sort-objects
              confirmPassword: {
                kind: 'string',
                label: t({
                  en: 'Confirm new password',
                  es: 'Confirmar la nueva contraseña',
                  fr: 'Confirmer le nouveau mot de passe'
                }),
                variant: 'password'
              }
            },
            title: t('common.password')
          }
        ]}
        customStyles={{ submitBtn: 'hidden' }}
        data-testid="update-user-form"
        id={id}
        initialValues={{
          ...initialValues,
          disabled: initialValues.disabled ?? false
        }}
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
            // Left undefined when the password field is blank, so saving other changes to a user
            // who still owes a reset does not quietly lift it.
            mustResetPassword: data.password ? isGeneratedPassword(data.password) : undefined
          })
        }
      />
    </div>
  );
};

export type { UpdateUserFormInputData, UpdateUserSubmitData };
