/* eslint-disable perfectionist/sort-objects */

import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $BasePermissionLevel, $CreateUserData } from '@opendatacapture/schemas/user';
import type { CreateUserData } from '@opendatacapture/schemas/user';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { PageHeader } from '@/components/PageHeader';

import { useCreateUserMutation } from '../hooks/useCreateUserMutation';
import { useGroupsQuery } from '../hooks/useGroupsQuery';

export const CreateUserPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const groupsQuery = useGroupsQuery();
  const createUserMutation = useCreateUserMutation();

  const handleSubmit = (data: CreateUserData) => {
    createUserMutation.mutate({ data });
    navigate('..');
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
        validationSchema={$CreateUserData
          .omit({
            groupIds: true
          })
          .extend({
            basePermissionLevel: $BasePermissionLevel,
            groupIds: z.set(z.string()).optional(),
            confirmPassword: z.string().min(1)
          })
          .superRefine((arg, ctx) => {
            if (!estimatePasswordStrength(arg.password).success) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message: t('common.insufficientPasswordStrength'),
                path: ['password']
              });
              return z.NEVER;
            }
            if (arg.confirmPassword !== arg.password) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('common.passwordsMustMatch'),
                path: ['confirmPassword']
              });
            }
          })}
        onSubmit={(data) => handleSubmit({ ...data, groupIds: Array.from(data.groupIds ?? []) })}
      />
    </div>
  );
};
