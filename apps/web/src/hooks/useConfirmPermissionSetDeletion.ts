import { useDestructiveAction, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { PermissionSetSummary } from '@opendatacapture/schemas/permission-set';

import { useDeletePermissionSetMutation } from './useDeletePermissionSetMutation';

type PermissionSetDeletionOptions = {
  onDeleted?: () => void;
};

/**
 * Deletes a permission set once the admin confirms, in a dialog stating how many users hold it:
 * deleting a set takes it from every holder, which is otherwise visible nowhere on the page.
 */
export function useConfirmPermissionSetDeletion() {
  const { t } = useTranslation();
  const confirm = useDestructiveAction();
  const deletePermissionSetMutation = useDeletePermissionSetMutation();

  const describeHolders = (holderCount: number) => {
    if (holderCount === 0) {
      return t({
        en: 'No user holds this permission set, so deleting it changes no one’s permissions.',
        es: 'Ningún usuario tiene este conjunto de permisos, por lo que eliminarlo no cambia los permisos de nadie.',
        fr: "Aucun utilisateur ne détient cet ensemble d'autorisations : le supprimer ne change les autorisations de personne."
      });
    } else if (holderCount === 1) {
      return t({
        en: '1 user holds this permission set. Deleting it removes it from them; from their next sign-in they keep only their base permissions.',
        es: '1 usuario tiene este conjunto de permisos. Eliminarlo se lo retira; a partir de su próximo inicio de sesión conservará solo sus permisos de base.',
        fr: "1 utilisateur détient cet ensemble d'autorisations. Le supprimer le lui retire ; dès sa prochaine connexion, il ne conservera que ses autorisations de base."
      });
    }
    return t({
      en: `${holderCount} users hold this permission set. Deleting it removes it from them; from their next sign-in they keep only their base permissions.`,
      es: `${holderCount} usuarios tienen este conjunto de permisos. Eliminarlo se lo retira; a partir de su próximo inicio de sesión conservarán solo sus permisos de base.`,
      fr: `${holderCount} utilisateurs détiennent cet ensemble d'autorisations. Le supprimer le leur retire ; dès leur prochaine connexion, ils ne conserveront que leurs autorisations de base.`
    });
  };

  return (
    { holderCount, id, name }: Pick<PermissionSetSummary, 'holderCount' | 'id' | 'name'>,
    { onDeleted }: PermissionSetDeletionOptions = {}
  ) => {
    confirm(
      () => {
        deletePermissionSetMutation.mutate({ id }, { onSuccess: onDeleted });
      },
      {
        description: describeHolders(holderCount),
        title: t({
          en: `Delete the permission set "${name}"?`,
          es: `¿Eliminar el conjunto de permisos «${name}»?`,
          fr: `Supprimer l'ensemble d'autorisations « ${name} » ?`
        })
      }
    );
  };
}
