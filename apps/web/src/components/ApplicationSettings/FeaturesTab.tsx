import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { config } from '@/config';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';

import { DefaultAssignmentDurationInput } from './DefaultAssignmentDurationInput';
import { SettingRows, SettingsCard, SettingToggle } from './SettingsCard';

import type { AutosaveSetupState } from './types';

type FeaturesTabProps = {
  autosave: AutosaveSetupState;
};

export const FeaturesTab = ({ autosave }: FeaturesTabProps) => {
  const { t } = useTranslation();
  const { data: setupState } = useSetupStateQuery();

  const uploaderLabel = t({ en: 'Enable Uploader', es: 'Activar la carga de datos', fr: 'Activer le téléversement' });
  const uploaderSection = {
    content: (
      <SettingRows
        rows={[
          {
            control: (
              <SettingToggle
                checked={setupState.isExperimentalFeaturesEnabled ?? false}
                label={uploaderLabel}
                onCheckedChange={(checked) => autosave({ isExperimentalFeaturesEnabled: checked })}
              />
            ),
            help: t({
              en: 'When enabled, an upload menu item appears in the sidebar that allows users to upload instrument records directly from data files, bypassing the normal session workflow.',
              es: 'Cuando está activada, aparece un elemento de menú de carga en la barra lateral que permite a los usuarios cargar registros de instrumentos directamente desde archivos de datos, sin pasar por el flujo de trabajo habitual de las sesiones.',
              fr: "Lorsqu'elle est activée, un élément de menu Téléversement apparaît dans le menu latéral et permet aux utilisateurs de téléverser des enregistrements d'instruments directement à partir de fichiers de données."
            }),
            label: uploaderLabel
          }
        ]}
      />
    ),
    label: t({ en: 'Uploader', es: 'Carga de datos', fr: 'Téléversement' })
  };

  // An instance without the gateway can never create a remote assignment, and the server reports
  // them disabled there whatever was saved, so neither setting could take effect.
  if (!config.setup.isGatewayEnabled) {
    return <SettingsCard sections={[uploaderSection]} />;
  }

  const remoteAssignmentsLabel = t({
    en: 'Enable Remote Assignments',
    es: 'Activar las tareas remotas',
    fr: 'Activer les tâches à distance'
  });
  const remoteAssignmentsSection = {
    content: (
      <SettingRows
        rows={[
          {
            control: <DefaultAssignmentDurationInput autosave={autosave} />,
            help: t({
              en: 'The number of days a new remote assignment stays valid by default. This only sets the initial expiry date when creating an assignment, which can still be changed for each one.',
              es: 'El número de días que una nueva tarea remota permanece válida de forma predeterminada. Esto solo define la fecha de vencimiento inicial al crear una tarea, que se puede cambiar en cada caso.',
              fr: "Le nombre de jours pendant lesquels une nouvelle tâche à distance reste valide par défaut. Ceci ne définit que la date d'expiration initiale lors de la création d'une tâche, qui peut toujours être modifiée pour chacune."
            }),
            label: t({
              en: 'Default Assignment Validity (Days)',
              es: 'Validez predeterminada de las tareas (días)',
              fr: 'Validité par défaut des tâches (jours)'
            })
          },
          {
            control: (
              <SettingToggle
                checked={setupState.isBulkRemoteAssignmentsEnabled ?? true}
                label={remoteAssignmentsLabel}
                onCheckedChange={(checked) => autosave({ isBulkRemoteAssignmentsEnabled: checked })}
              />
            ),
            help: t({
              en: 'When enabled, the group links are collected under a Group Actions menu with an added page for assigning one or more instruments to many subjects at once. When disabled, those links stay where they are.',
              es: 'Cuando está activada, los enlaces del grupo se reúnen bajo un menú Acciones del grupo con una página adicional para asignar uno o varios instrumentos a muchos sujetos a la vez. Cuando está desactivada, esos enlaces permanecen donde están.',
              fr: 'Lorsqu’elle est activée, les liens de groupe sont regroupés sous un menu Actions de groupe avec une page permettant d’attribuer un ou plusieurs instruments à plusieurs sujets à la fois. Lorsqu’elle est désactivée, ces liens restent inchangés.'
            }),
            label: remoteAssignmentsLabel
          }
        ]}
      />
    ),
    label: t({ en: 'Remote Assignments', es: 'Tareas remotas', fr: 'Tâches à distance' })
  };

  return <SettingsCard sections={[remoteAssignmentsSection, uploaderSection]} />;
};
