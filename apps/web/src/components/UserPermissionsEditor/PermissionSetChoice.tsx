import { Label, Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { PermissionSetSummary } from '@opendatacapture/schemas/permission-set';

import { PermissionSetRulesEditor } from '@/components/PermissionSetRulesEditor';

import { WarningCallout } from './WarningCallout';

type PermissionSetChoiceProps = {
  /** Whether the user holds saved custom grants, which assigning a set removes. */
  discardsCustomGrants: boolean;
  highlightIncomplete?: boolean;
  isSaving?: boolean;
  onPermissionSetIdChange: (permissionSetId: string) => void;
  permissionSetId: string | undefined;
  permissionSets: PermissionSetSummary[];
};

/** The permission set a user holds, chosen from every set, with what the chosen one grants beneath it. */
export const PermissionSetChoice = ({
  discardsCustomGrants,
  highlightIncomplete,
  isSaving,
  onPermissionSetIdChange,
  permissionSetId,
  permissionSets
}: PermissionSetChoiceProps) => {
  const { t } = useTranslation();
  const chosen = permissionSets.find((permissionSet) => permissionSet.id === permissionSetId);

  if (permissionSets.length === 0) {
    return (
      <p className="text-muted-foreground text-sm" data-testid="user-permission-set-none">
        {t({
          en: 'No permission sets exist yet. An administrator can create one under Manage Permission Sets.',
          es: 'Todavía no existe ningún conjunto de permisos. Un administrador puede crear uno en Gestionar conjuntos de permisos.',
          fr: "Aucun ensemble d'autorisations n'existe encore. Un administrateur peut en créer un sous Gérer les ensembles d'autorisations."
        })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>{t({ en: 'Permission set', es: 'Conjunto de permisos', fr: "Ensemble d'autorisations" })}</Label>
        <Select disabled={isSaving} value={permissionSetId ?? ''} onValueChange={onPermissionSetIdChange}>
          <Select.Trigger
            aria-invalid={(highlightIncomplete && !chosen) || undefined}
            data-testid="permission-set-select-trigger"
          >
            <Select.Value
              placeholder={t({
                en: 'Choose a permission set…',
                es: 'Elija un conjunto de permisos…',
                fr: "Choisir un ensemble d'autorisations…"
              })}
            />
          </Select.Trigger>
          <Select.Content data-testid="permission-set-select-content">
            {permissionSets.map((permissionSet) => (
              <Select.Item
                data-testid={`permission-set-select-item-${permissionSet.id}`}
                key={permissionSet.id}
                value={permissionSet.id}
              >
                {permissionSet.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      {highlightIncomplete && !chosen && (
        <p className="text-destructive text-sm font-medium" data-testid="permission-set-required" role="alert">
          {t({
            en: 'Choose a permission set, or switch to custom permissions.',
            es: 'Elija un conjunto de permisos o cambie a permisos personalizados.',
            fr: "Choisissez un ensemble d'autorisations ou passez aux autorisations personnalisées."
          })}
        </p>
      )}
      {chosen && (
        <div className="flex flex-col gap-2" data-testid="permission-set-chosen">
          <PermissionSetRulesEditor readOnly rules={chosen.rules} />
        </div>
      )}
      {discardsCustomGrants && (
        <WarningCallout data-testid="user-permissions-discard-warning">
          {t({
            en: "This user holds custom grants. Saving with a permission set removes them, since a user's permissions come from one or the other.",
            es: 'Este usuario tiene permisos personalizados. Guardar con un conjunto de permisos los elimina, ya que los permisos de un usuario provienen de uno u otro.',
            fr: "Cet utilisateur détient des autorisations personnalisées. Enregistrer avec un ensemble d'autorisations les retire, puisque les autorisations d'un utilisateur proviennent de l'un ou de l'autre."
          })}
        </WarningCallout>
      )}
    </div>
  );
};
