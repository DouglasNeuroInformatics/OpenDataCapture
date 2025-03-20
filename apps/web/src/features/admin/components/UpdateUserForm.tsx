import { isAllUndefined } from '@douglasneuroinformatics/libjs';
import { Button, Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { $UserPermission } from '@opendatacapture/schemas/user';
import type { UserPermission } from '@opendatacapture/schemas/user';
import type { Promisable } from 'type-fest';
import { z } from 'zod';

const $UpdateUserFormData = z
  .object({
    additionalPermissions: z.array($UserPermission.partial()).optional(),
    groupIds: z.set(z.string())
  })
  .transform((arg) => {
    const firstPermission = arg.additionalPermissions?.[0];
    if (firstPermission && isAllUndefined(firstPermission)) {
      arg.additionalPermissions?.pop();
    }
    return arg;
  })
  .superRefine((arg, ctx) => {
    arg.additionalPermissions?.forEach((permission, i) => {
      Object.entries(permission).forEach(([key, val]) => {
        if ((val satisfies string) === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_type,
            expected: 'string',
            path: ['additionalPermissions', i, key],
            received: 'undefined'
          });
        }
      });
    });
  });

type UpdateUserFormData = z.infer<typeof $UpdateUserFormData>;

export type UpdateUserFormInputData = {
  disableDelete: boolean;
  groupOptions: {
    [id: string]: string;
  };
  initialValues?: FormTypes.PartialNullableData<UpdateUserFormData>;
};

export const UpdateUserForm: React.FC<{
  data: UpdateUserFormInputData;
  onDelete: () => void;
  onSubmit: (data: UpdateUserFormData & { additionalPermissions?: UserPermission[] }) => Promisable<void>;
}> = ({ data, onDelete, onSubmit }) => {
  const { disableDelete, groupOptions, initialValues } = data;
  const { t } = useTranslation();

  return (
    <Form
      additionalButtons={{
        left: (
          <Button className="w-full" disabled={disableDelete} type="button" variant="danger" onClick={onDelete}>
            {t('core.delete')}
          </Button>
        )
      }}
      content={[
        {
          description: t({
            en: 'IMPORTANT: These permissions are not specific to any group. To manage granular permissions, please use the API.',
            fr: "IMPORTANT : Ces autorisations ne sont pas spécifiques à un groupe. Pour gérer des autorisations granulaires, veuillez utiliser l'API."
          }),
          fields: {
            additionalPermissions: {
              fieldset: {
                action: {
                  kind: 'string',
                  label: t({
                    en: 'Action',
                    fr: 'Action'
                  }),
                  options: {
                    create: t({
                      en: 'Create',
                      fr: 'Créer'
                    }),
                    delete: t({
                      en: 'Delete',
                      fr: 'Effacer'
                    }),
                    manage: t({
                      en: 'Manage (All)',
                      fr: 'Gérer (Tout)'
                    }),
                    read: t({
                      en: 'Read',
                      fr: 'Lire'
                    }),
                    update: t({
                      en: 'Update',
                      fr: 'Mettre à jour'
                    })
                  },
                  variant: 'select'
                },
                subject: {
                  kind: 'string',
                  label: t({
                    en: 'Resource',
                    fr: 'Resource'
                  }),
                  options: {
                    all: t({
                      en: 'All',
                      fr: 'Tous'
                    }),
                    Assignment: t({
                      en: 'Assignment',
                      fr: 'Devoir'
                    }),
                    Group: t({
                      en: 'Group',
                      fr: 'Groupe'
                    }),
                    Instrument: t({
                      en: 'Instrument',
                      fr: 'Instrument'
                    }),
                    InstrumentRecord: t({
                      en: 'Instrument Record',
                      fr: "Enregistrement de l'instrument"
                    }),
                    Session: t({
                      en: 'Session',
                      fr: 'Session'
                    }),
                    Subject: t({
                      en: 'Subject',
                      fr: 'Client'
                    }),
                    User: t({
                      en: 'User',
                      fr: 'Utilisateur'
                    })
                  },
                  variant: 'select'
                }
              },
              kind: 'record-array',
              label: t({
                en: 'Permission',
                fr: 'Autorisations supplémentaires'
              })
            }
          },
          title: t({
            en: 'Authorization',
            fr: 'Autorisation'
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
      initialValues={initialValues}
      key={JSON.stringify(initialValues)}
      submitBtnLabel={t('core.save')}
      validationSchema={$UpdateUserFormData}
      onSubmit={({ additionalPermissions, ...data }) =>
        onSubmit({ additionalPermissions: additionalPermissions as undefined | UserPermission[], ...data })
      }
    />
  );
};
