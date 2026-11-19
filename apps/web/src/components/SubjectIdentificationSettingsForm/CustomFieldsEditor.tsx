import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import { CUSTOM_FIELDS_MAX_FIELD_COUNT } from '@opendatacapture/schemas/subject-identification';
import { ChevronDownIcon, ChevronUpIcon, LockIcon, LockOpenIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { SectionCard } from '@/components/SectionCard';
import {
  createCustomFieldDraft,
  createCustomFieldsDraft,
  isCustomFieldsLabelMissing
} from '@/utils/subject-identification-draft';
import type { CustomFieldDraft, CustomFieldsDraft } from '@/utils/subject-identification-draft';

import { CustomFieldEditor } from './CustomFieldEditor';
import { LocalizedTextInputs } from './LocalizedTextInputs';

type LockStatusProps = {
  isLocked: boolean;
};

const LockStatus = ({ isLocked }: LockStatusProps) => {
  const { t } = useTranslation();
  return (
    <div
      className="border-border flex items-start gap-3 rounded-md border p-3 text-sm"
      data-locked={isLocked}
      data-testid="custom-fields-lock-status"
    >
      {isLocked ? (
        <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <LockOpenIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {isLocked
            ? t({ en: 'Locked', es: 'Bloqueado', fr: 'Verrouillé' })
            : t({ en: 'Not Locked', es: 'No bloqueado', fr: 'Non verrouillé' })}
        </p>
        <p className="text-muted-foreground">
          {isLocked
            ? t({
                en: 'Subjects have been identified with these fields, so their number and order can no longer change and the definition cannot be removed. Labels, help text, patterns and error messages can still be edited.',
                es: 'Se han identificado sujetos con estos campos, por lo que su número y su orden ya no pueden cambiar y la definición no se puede eliminar. Las etiquetas, los textos de ayuda, los patrones y los mensajes de error siguen siendo editables.',
                fr: "Des sujets ont été identifiés avec ces champs : leur nombre et leur ordre ne peuvent plus changer et la définition ne peut plus être supprimée. Les étiquettes, les textes d'aide, les motifs et les messages d'erreur restent modifiables."
              })
            : t({
                en: 'No subject has been identified with these fields yet, so they can still be added, removed and reordered. Their number and order are fixed once one is.',
                es: 'Todavía no se ha identificado ningún sujeto con estos campos, por lo que aún se pueden agregar, eliminar y reordenar. Su número y su orden quedan fijos en cuanto se identifique uno.',
                fr: "Aucun sujet n'a encore été identifié avec ces champs : ils peuvent encore être ajoutés, supprimés et réordonnés. Leur nombre et leur ordre sont figés dès qu'un sujet l'est."
              })}
        </p>
      </div>
    </div>
  );
};

type FieldListControlsProps = {
  fieldCount: number;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  position: number;
};

const FieldListControls = ({ fieldCount, onMoveDown, onMoveUp, onRemove, position }: FieldListControlsProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 gap-0.5">
      <Button
        aria-label={t({ en: 'Move up', es: 'Mover hacia arriba', fr: 'Monter' })}
        data-testid={`custom-field-${position}-move-up`}
        disabled={position === 0}
        size="sm"
        type="button"
        variant="ghost"
        onClick={onMoveUp}
      >
        <ChevronUpIcon className="h-4 w-4" />
      </Button>
      <Button
        aria-label={t({ en: 'Move down', es: 'Mover hacia abajo', fr: 'Descendre' })}
        data-testid={`custom-field-${position}-move-down`}
        disabled={position === fieldCount - 1}
        size="sm"
        type="button"
        variant="ghost"
        onClick={onMoveDown}
      >
        <ChevronDownIcon className="h-4 w-4" />
      </Button>
      <Button
        aria-label={t({ en: 'Remove field', es: 'Eliminar el campo', fr: 'Supprimer le champ' })}
        data-testid={`custom-field-${position}-remove`}
        disabled={fieldCount === 1}
        size="sm"
        type="button"
        variant="ghost"
        onClick={onRemove}
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
};

type DefinitionEditorProps = {
  activeLanguages: readonly Language[];
  isLocked: boolean;
  onChange: (value: CustomFieldsDraft | null) => void;
  showErrors: boolean;
  value: CustomFieldsDraft;
};

const DefinitionEditor = ({ activeLanguages, isLocked, onChange, showErrors, value }: DefinitionEditorProps) => {
  const { t } = useTranslation();
  const { fields } = value;
  const updateFields = (next: CustomFieldDraft[]) => onChange({ ...value, fields: next });
  // Swaps the field at `position` with the one before it.
  const raiseField = (position: number) => {
    updateFields([
      ...fields.slice(0, position - 1),
      ...fields.slice(position - 1, position + 1).reverse(),
      ...fields.slice(position + 1)
    ]);
  };
  const isFull = fields.length >= CUSTOM_FIELDS_MAX_FIELD_COUNT;

  return (
    <div className="flex flex-col gap-6">
      <LockStatus isLocked={isLocked} />
      <LocalizedTextInputs
        description={t({
          en: 'The name staff see for this identification method, e.g. "Animal information". Required in at least one language.',
          es: 'El nombre que ve el personal para este método de identificación, p. ej. «Información del animal». Obligatorio en al menos un idioma.',
          fr: "Le nom que voit le personnel pour cette méthode d'identification, p. ex. « Informations sur l'animal ». Obligatoire dans au moins une langue."
        })}
        idPrefix="custom-fields-label"
        isMissing={showErrors && isCustomFieldsLabelMissing(value)}
        label={t({ en: 'Method Label', es: 'Etiqueta del método', fr: 'Étiquette de la méthode' })}
        languages={activeLanguages}
        value={value.label}
        onChange={(label) => onChange({ ...value, label })}
      />
      <div className="flex flex-col gap-3">
        <Heading variant="h5">{t({ en: 'Fields', es: 'Campos', fr: 'Champs' })}</Heading>
        <p className="text-muted-foreground text-sm">
          {t({
            en: 'Staff fill in every field, in this order, to identify a subject.',
            es: 'El personal completa todos los campos, en este orden, para identificar a un sujeto.',
            fr: 'Le personnel remplit chaque champ, dans cet ordre, pour identifier un sujet.'
          })}
        </p>
        <p className="text-sm" data-testid="custom-fields-label-note">
          {t({
            en: 'A label may be corrected, but never given a new meaning: renaming "Animal ID" to "Cage number" would have staff type something else, which identifies a different subject.',
            es: 'Una etiqueta puede corregirse, pero nunca cambiar de significado: renombrar «ID del animal» como «Número de jaula» haría que el personal escribiera otra cosa, lo que identifica a otro sujeto.',
            fr: "Une étiquette peut être corrigée, mais jamais changer de sens : renommer « ID de l'animal » en « Numéro de cage » amènerait le personnel à saisir autre chose, ce qui identifie un autre sujet."
          })}
        </p>
        {fields.map((field, position) => (
          <CustomFieldEditor
            activeLanguages={activeLanguages}
            key={field.key}
            listControls={
              isLocked ? undefined : (
                <FieldListControls
                  fieldCount={fields.length}
                  position={position}
                  onMoveDown={() => raiseField(position + 1)}
                  onMoveUp={() => raiseField(position)}
                  onRemove={() => updateFields(fields.filter((_, index) => index !== position))}
                />
              )
            }
            position={position}
            showErrors={showErrors}
            value={field}
            onChange={(next) => updateFields(fields.map((current, index) => (index === position ? next : current)))}
          />
        ))}
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              data-testid="custom-fields-add-field"
              disabled={isFull}
              type="button"
              variant="outline"
              onClick={() => updateFields([...fields, createCustomFieldDraft()])}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {t({ en: 'Add Field', es: 'Agregar un campo', fr: 'Ajouter un champ' })}
            </Button>
            {isFull && (
              <p className="text-muted-foreground text-sm" data-testid="custom-fields-full">
                {t(
                  {
                    en: 'A definition has at most {} fields.',
                    es: 'Una definición tiene como máximo {} campos.',
                    fr: 'Une définition compte au plus {} champs.'
                  },
                  { args: [CUSTOM_FIELDS_MAX_FIELD_COUNT] }
                )}
              </p>
            )}
          </div>
        )}
      </div>
      {!isLocked && (
        <div className="border-border flex flex-col items-start gap-2 border-t pt-4">
          <Button data-testid="custom-fields-remove" type="button" variant="danger" onClick={() => onChange(null)}>
            <Trash2Icon className="mr-2 h-4 w-4" />
            {t({ en: 'Remove Definition', es: 'Eliminar la definición', fr: 'Supprimer la définition' })}
          </Button>
          <p className="text-muted-foreground text-xs">
            {t({
              en: 'Until a subject has been identified with these fields, the whole definition can be removed. It is removed when you save.',
              es: 'Mientras no se haya identificado ningún sujeto con estos campos, se puede eliminar toda la definición. Se elimina al guardar.',
              fr: "Tant qu'aucun sujet n'a été identifié avec ces champs, la définition entière peut être supprimée. Elle l'est à l'enregistrement."
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export type CustomFieldsEditorProps = {
  activeLanguages: readonly Language[];
  /** Whether a definition is saved, which a draft of `null` removes when the tab is saved. */
  isDefinitionStored: boolean;
  isLocked: boolean;
  onChange: (value: CustomFieldsDraft | null) => void;
  /** Shows every missing entry as an error, once a save has been refused for one. */
  showErrors: boolean;
  title: string;
  value: CustomFieldsDraft | null;
};

/** The admin's definition of the fields that identify a subject under the `CUSTOM_FIELDS` method. */
export const CustomFieldsEditor = ({
  activeLanguages,
  isDefinitionStored,
  isLocked,
  onChange,
  showErrors,
  title,
  value
}: CustomFieldsEditorProps) => {
  const { t } = useTranslation();
  return (
    <SectionCard data-testid="custom-fields-card">
      <Heading className="mb-1" variant="h4">
        {title}
      </Heading>
      <p className="text-muted-foreground mb-4 text-sm">
        {t({
          en: "Define the fields staff fill in to identify a subject, such as an animal or record number. What they type is hashed in the browser into the subject's id, and is never sent or stored.",
          es: 'Defina los campos que el personal completa para identificar a un sujeto, como un número de animal o de expediente. Lo que escribe se convierte en el navegador, mediante un hash, en el identificador del sujeto, y nunca se envía ni se almacena.',
          fr: "Définissez les champs que le personnel remplit pour identifier un sujet, comme un numéro d'animal ou de dossier. Ce qu'il saisit est haché dans le navigateur pour former l'identifiant du sujet, et n'est jamais envoyé ni stocké."
        })}
      </p>
      {value ? (
        <DefinitionEditor
          activeLanguages={activeLanguages}
          isLocked={isLocked}
          showErrors={showErrors}
          value={value}
          onChange={onChange}
        />
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm" data-testid="custom-fields-empty">
            {isDefinitionStored
              ? t({
                  en: 'The identifying fields will be removed when you save.',
                  es: 'Los campos de identificación se eliminarán al guardar.',
                  fr: "Les champs d'identification seront supprimés à l'enregistrement."
                })
              : t({
                  en: 'No identifying fields are defined.',
                  es: 'No hay campos de identificación definidos.',
                  fr: "Aucun champ d'identification n'est défini."
                })}
          </p>
          <Button
            data-testid="custom-fields-define"
            type="button"
            variant="outline"
            onClick={() => onChange(createCustomFieldsDraft())}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t({ en: 'Define Fields', es: 'Definir los campos', fr: 'Définir les champs' })}
          </Button>
        </div>
      )}
    </SectionCard>
  );
};
