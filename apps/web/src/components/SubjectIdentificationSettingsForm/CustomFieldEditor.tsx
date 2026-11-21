import type React from 'react';

import { Input } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import { compileCustomFieldPattern } from '@opendatacapture/schemas/subject-identification';

import { FormField } from '@/components/FormField';
import { findCustomFieldIssues } from '@/utils/subject-identification-draft';
import type { CustomFieldDraft } from '@/utils/subject-identification-draft';

import { CustomFieldTestBox } from './CustomFieldTestBox';
import { LocalizedTextInputs } from './LocalizedTextInputs';

export type CustomFieldEditorProps = {
  activeLanguages: readonly Language[];
  /** Shown beside the field's heading: the controls that move or remove it, while the list may change. */
  listControls?: React.ReactNode;
  onChange: (field: CustomFieldDraft) => void;
  /** The field's position, from 0, which its test ids carry, e.g. `custom-field-0-pattern`. */
  position: number;
  /** Shows a missing label or pattern as an error. A pattern that does not compile is shown regardless. */
  showErrors: boolean;
  value: CustomFieldDraft;
};

export const CustomFieldEditor = ({
  activeLanguages,
  listControls,
  onChange,
  position,
  showErrors,
  value
}: CustomFieldEditorProps) => {
  const { t } = useTranslation();
  const issues = findCustomFieldIssues(value);
  const idPrefix = `custom-field-${position}`;

  const findPatternError = () => {
    if (!issues.pattern) {
      return undefined;
    } else if (value.pattern !== '') {
      return t({
        en: 'This is not a valid regular expression.',
        es: 'Esta no es una expresión regular válida.',
        fr: "Ce n'est pas une expression régulière valide."
      });
    }
    return showErrors
      ? t({ en: 'Enter a pattern.', es: 'Introduzca un patrón.', fr: 'Saisissez un motif.' })
      : undefined;
  };

  return (
    <div className="border-border flex flex-col gap-4 rounded-lg border p-4" data-testid={idPrefix}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">
          {t({ en: `Field ${position + 1}`, es: `Campo ${position + 1}`, fr: `Champ ${position + 1}` })}
        </h4>
        {listControls}
      </div>
      <LocalizedTextInputs
        description={t({
          en: 'Shown to staff above the input. Required in at least one language.',
          es: 'Se muestra al personal encima del campo. Obligatoria en al menos un idioma.',
          fr: 'Affichée au personnel au-dessus du champ. Obligatoire dans au moins une langue.'
        })}
        idPrefix={`${idPrefix}-label`}
        isMissing={showErrors && issues.label}
        label={t({ en: 'Label', es: 'Etiqueta', fr: 'Étiquette' })}
        languages={activeLanguages}
        value={value.label}
        onChange={(label) => onChange({ ...value, label })}
      />
      <LocalizedTextInputs
        description={t({
          en: 'Optional. Shown to staff beneath the input.',
          es: 'Opcional. Se muestra al personal debajo del campo.',
          fr: 'Facultatif. Affiché au personnel sous le champ.'
        })}
        idPrefix={`${idPrefix}-help`}
        label={t({ en: 'Help Text', es: 'Texto de ayuda', fr: "Texte d'aide" })}
        languages={activeLanguages}
        value={value.description}
        onChange={(description) => onChange({ ...value, description })}
      />
      <FormField
        description={t({
          en: 'A regular expression that must match the whole value once it has been uppercased and stripped of everything but letters and digits. For example, [A-Z]{2}[0-9]{4} accepts "ab-1234".',
          es: 'Una expresión regular que debe coincidir con todo el valor una vez pasado a mayúsculas y sin nada que no sean letras y dígitos. Por ejemplo, [A-Z]{2}[0-9]{4} acepta «ab-1234».',
          fr: "Une expression régulière qui doit correspondre à toute la valeur une fois celle-ci mise en majuscules et débarrassée de tout ce qui n'est pas une lettre ou un chiffre. Par exemple, [A-Z]{2}[0-9]{4} accepte « ab-1234 »."
        })}
        error={findPatternError()}
        htmlFor={`${idPrefix}-pattern`}
        label={t({ en: 'Pattern', es: 'Patrón', fr: 'Motif' })}
      >
        <Input
          autoComplete="off"
          className="font-mono"
          data-testid={`${idPrefix}-pattern`}
          id={`${idPrefix}-pattern`}
          spellCheck={false}
          value={value.pattern}
          onChange={(event) => onChange({ ...value, pattern: event.target.value })}
        />
      </FormField>
      <LocalizedTextInputs
        description={t({
          en: 'Optional. Shown to staff when a value does not match the pattern.',
          es: 'Opcional. Se muestra al personal cuando un valor no coincide con el patrón.',
          fr: "Facultatif. Affiché au personnel lorsqu'une valeur ne correspond pas au motif."
        })}
        idPrefix={`${idPrefix}-error-message`}
        label={t({ en: 'Error Message', es: 'Mensaje de error', fr: "Message d'erreur" })}
        languages={activeLanguages}
        value={value.patternErrorMessage}
        onChange={(patternErrorMessage) => onChange({ ...value, patternErrorMessage })}
      />
      <CustomFieldTestBox
        compiledPattern={issues.pattern ? null : compileCustomFieldPattern(value.pattern)}
        idPrefix={`${idPrefix}-test`}
      />
    </div>
  );
};
