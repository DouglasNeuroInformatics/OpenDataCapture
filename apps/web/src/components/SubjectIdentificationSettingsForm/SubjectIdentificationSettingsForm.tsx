import React, { useState } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { $UpdateSubjectIdentificationSettingsData } from '@opendatacapture/schemas/subject-identification';
import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Loader2Icon } from 'lucide-react';

import { useSubjectIdentificationCountsQuery } from '@/hooks/useSubjectIdentificationCountsQuery';
import { useSubjectIdentificationMethodOptions } from '@/hooks/useSubjectIdentificationMethodOptions';
import { subjectIdentificationSettingsQueryOptions } from '@/hooks/useSubjectIdentificationSettingsQuery';
import { useUpdateSubjectIdentificationSettingsMutation } from '@/hooks/useUpdateSubjectIdentificationSettingsMutation';
import { sortByLabel } from '@/utils/sort-by-label';
import {
  toSubjectIdentificationDraft,
  toUpdateSubjectIdentificationSettingsData
} from '@/utils/subject-identification-draft';
import type { SubjectIdentificationDraft } from '@/utils/subject-identification-draft';

import { CustomFieldsEditor } from './CustomFieldsEditor';
import { OfferedMethodsSection } from './OfferedMethodsSection';

export type SubjectIdentificationSettingsFormProps = {
  activeLanguages: readonly Language[];
  settings: SubjectIdentificationSettings;
};

/**
 * The Subject Identification tab's one form. Every section edits its part of one draft, and the
 * save button sends the whole draft in one request.
 */
export const SubjectIdentificationSettingsForm = ({
  activeLanguages,
  settings
}: SubjectIdentificationSettingsFormProps) => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const queryClient = useQueryClient();
  const updateMutation = useUpdateSubjectIdentificationSettingsMutation();
  const [draft, setDraft] = useState<SubjectIdentificationDraft>(() => toSubjectIdentificationDraft(settings));
  const [showErrors, setShowErrors] = useState(false);
  // The checked body awaiting confirmation, so what is confirmed is exactly what is sent.
  const [confirmingUpdate, setConfirmingUpdate] = useState<$UpdateSubjectIdentificationSettingsData | null>(null);

  const parsedUpdateData = $UpdateSubjectIdentificationSettingsData.safeParse(
    toUpdateSubjectIdentificationSettingsData(draft)
  );
  const isValid = parsedUpdateData.success;

  // A method being turned off strands the subjects it identifies until it is offered again.
  const methodsTurnedOff = settings.offeredMethods.filter((method) => !draft.offeredMethods.includes(method));
  const countsQuery = useSubjectIdentificationCountsQuery({ isEnabled: methodsTurnedOff.length > 0 });
  const { options: methodLabels } = useSubjectIdentificationMethodOptions(settings);
  const isFirstDefinition = settings.customFields === null && draft.customFields !== null;

  const save = async (updateData: $UpdateSubjectIdentificationSettingsData) => {
    const saveFailedTitle = t({ en: 'Save failed', es: 'Error al guardar', fr: "Échec de l'enregistrement" });
    try {
      await updateMutation.mutateAsync(updateData);
      setShowErrors(false);
      addNotification({ type: 'success' });
    } catch (error) {
      // The server answers 409 only to a change the lock forbids, so a subject was identified with the
      // fields after this page loaded, and the draft's field list can never be saved.
      if (!(isAxiosError(error) && error.response?.status === 409)) {
        addNotification({
          message: t({
            en: 'Your changes were not saved. Check your connection and try again.',
            es: 'Sus cambios no se guardaron. Compruebe su conexión e inténtelo de nuevo.',
            fr: "Vos modifications n'ont pas été enregistrées. Vérifiez votre connexion et réessayez."
          }),
          title: saveFailedTitle,
          type: 'error'
        });
        return;
      }
      addNotification({
        message: t({
          en: 'A subject was identified with these fields while you were editing, so the field list is now locked. The saved definition has been reloaded; make your other changes again.',
          es: 'Se identificó a un sujeto con estos campos mientras usted editaba, por lo que la lista de campos está ahora bloqueada. Se ha vuelto a cargar la definición guardada; vuelva a hacer sus demás cambios.',
          fr: 'Un sujet a été identifié avec ces champs pendant votre édition : la liste des champs est désormais verrouillée. La définition enregistrée a été rechargée ; refaites vos autres modifications.'
        }),
        title: saveFailedTitle,
        type: 'error'
      });
      setDraft(toSubjectIdentificationDraft(await queryClient.fetchQuery(subjectIdentificationSettingsQueryOptions())));
    }
  };

  const handleSave = () => {
    if (!parsedUpdateData.success) {
      setShowErrors(true);
    } else if (isFirstDefinition || methodsTurnedOff.length > 0) {
      setConfirmingUpdate(parsedUpdateData.data);
    } else {
      void save(parsedUpdateData.data);
    }
  };

  const customFieldsTitle = t({
    en: 'Custom Identifying Fields',
    es: 'Campos de identificación personalizados',
    fr: "Champs d'identification personnalisés"
  });
  const offeredMethodsTitle = t({ en: 'Offered Methods', es: 'Métodos ofrecidos', fr: 'Méthodes proposées' });
  const sections = sortByLabel([
    {
      content: (
        <CustomFieldsEditor
          activeLanguages={activeLanguages}
          isDefinitionStored={settings.customFields !== null}
          isLocked={settings.isCustomFieldsLocked}
          showErrors={showErrors}
          title={customFieldsTitle}
          value={draft.customFields}
          onChange={(customFields) => {
            setDraft((current) => ({
              customFields,
              // Custom fields can be offered only while they are defined.
              offeredMethods: customFields
                ? current.offeredMethods
                : current.offeredMethods.filter((method) => method !== 'CUSTOM_FIELDS')
            }));
          }}
        />
      ),
      key: 'custom-fields',
      label: customFieldsTitle
    },
    {
      content: (
        <OfferedMethodsSection
          customFields={draft.customFields}
          showErrors={showErrors}
          title={offeredMethodsTitle}
          value={draft.offeredMethods}
          onChange={(offeredMethods) => setDraft((current) => ({ ...current, offeredMethods }))}
        />
      ),
      key: 'offered-methods',
      label: offeredMethodsTitle
    }
  ]);

  return (
    <div className="flex flex-col gap-6" data-testid="subject-identification-settings">
      {sections.map(({ content, key }) => (
        <React.Fragment key={key}>{content}</React.Fragment>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          data-testid="subject-identification-save"
          disabled={updateMutation.isPending}
          type="button"
          variant="primary"
          onClick={handleSave}
        >
          {updateMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {t('core.save')}
        </Button>
        {showErrors && !isValid && (
          <p className="text-destructive text-sm font-medium" data-testid="subject-identification-invalid">
            {t({
              en: 'Complete the entries marked above, then save again.',
              es: 'Complete las entradas señaladas arriba y vuelva a guardar.',
              fr: 'Complétez les entrées signalées ci-dessus, puis enregistrez de nouveau.'
            })}
          </p>
        )}
      </div>
      {confirmingUpdate && (
        <Dialog open onOpenChange={() => setConfirmingUpdate(null)}>
          <Dialog.Content className="max-w-md" data-testid="subject-identification-confirm-dialog">
            <Dialog.Header>
              <Dialog.Title>
                {t({
                  en: 'Save the subject identification settings?',
                  es: '¿Guardar la configuración de identificación de sujetos?',
                  fr: "Enregistrer les paramètres d'identification des sujets ?"
                })}
              </Dialog.Title>
              {methodsTurnedOff.length > 0 && (
                <div className="flex flex-col gap-2 text-sm" data-testid="subject-identification-turn-off-warning">
                  <p>
                    {t({
                      en: 'Staff will not be able to start a session for the subjects these methods identify until the method is offered again:',
                      es: 'El personal no podrá iniciar una sesión para los sujetos que identifican estos métodos hasta que el método vuelva a ofrecerse:',
                      fr: 'Le personnel ne pourra plus démarrer de session pour les sujets identifiés par ces méthodes tant que la méthode ne sera pas de nouveau proposée :'
                    })}
                  </p>
                  <ul className="list-disc pl-5">
                    {methodsTurnedOff.map((method: SubjectIdentificationMethod) => (
                      <li data-testid={`turn-off-count-${method}`} key={method}>
                        {t(
                          { en: '{}: {} subjects', es: '{}: {} sujetos', fr: '{} : {} sujets' },
                          { args: [methodLabels[method], countsQuery.data?.[method] ?? '…'] }
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {isFirstDefinition && (
                <Dialog.Description>
                  {t({
                    en: 'Once a subject has been identified with these fields, the field list cannot change: no field can be added, removed or moved, and the definition cannot be removed. Labels, help text, patterns and error messages stay editable.',
                    es: 'Una vez que se haya identificado a un sujeto con estos campos, la lista de campos no podrá cambiar: no se podrá agregar, eliminar ni mover ningún campo, ni eliminar la definición. Las etiquetas, los textos de ayuda, los patrones y los mensajes de error seguirán siendo editables.',
                    fr: "Dès qu'un sujet aura été identifié avec ces champs, la liste des champs ne pourra plus changer : aucun champ ne pourra être ajouté, supprimé ou déplacé, et la définition ne pourra plus être supprimée. Les étiquettes, les textes d'aide, les motifs et les messages d'erreur resteront modifiables."
                  })}
                </Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Footer>
              <Button
                data-testid="subject-identification-cancel-save"
                type="button"
                variant="outline"
                onClick={() => setConfirmingUpdate(null)}
              >
                {t('core.cancel')}
              </Button>
              <Button
                data-testid="subject-identification-confirm-save"
                type="button"
                variant="primary"
                onClick={() => {
                  setConfirmingUpdate(null);
                  void save(confirmingUpdate);
                }}
              >
                {t('core.save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </div>
  );
};
