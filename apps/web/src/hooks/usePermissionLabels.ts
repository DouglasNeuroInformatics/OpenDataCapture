import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';

/** What each action and resource a permission can name is called in the interface language. */
export function usePermissionLabels() {
  const { t } = useTranslation();

  const actionLabels: { [K in AppAction]: string } = {
    create: t({ en: 'Create', es: 'Crear', fr: 'Créer' }),
    delete: t({ en: 'Delete', es: 'Eliminar', fr: 'Supprimer' }),
    manage: t({ en: 'Manage (All)', es: 'Gestionar (todo)', fr: 'Gérer (Tout)' }),
    read: t({ en: 'Read', es: 'Leer', fr: 'Lire' }),
    update: t({ en: 'Update', es: 'Actualizar', fr: 'Modifier' })
  };

  const subjectLabels: { [K in AppSubjectName]: string } = {
    all: t({ en: 'All', es: 'Todo', fr: 'Tous' }),
    Assignment: t({ en: 'Assignment', es: 'Asignación', fr: 'Assignation' }),
    Group: t({ en: 'Group', es: 'Grupo', fr: 'Groupe' }),
    Instrument: t({ en: 'Instrument', es: 'Instrumento', fr: 'Instrument' }),
    InstrumentRecord: t({
      en: 'Instrument Record',
      es: 'Registro de instrumento',
      fr: "Enregistrement de l'instrument"
    }),
    InstrumentRepo: t({ en: 'Instrument Repository', es: 'Repositorio de instrumentos', fr: "Dépôt d'instruments" }),
    Session: t({ en: 'Session', es: 'Sesión', fr: 'Session' }),
    Subject: t({ en: 'Subject', es: 'Sujeto', fr: 'Client' }),
    User: t({ en: 'User', es: 'Usuario', fr: 'Utilisateur' })
  };

  const columnLabels = {
    action: t({ en: 'Action', es: 'Acción', fr: 'Action' }),
    scope: t({ en: 'Scope', es: 'Alcance', fr: 'Portée' }),
    subject: t({ en: 'Resource', es: 'Recurso', fr: 'Ressource' })
  };

  return { actionLabels, columnLabels, subjectLabels };
}
