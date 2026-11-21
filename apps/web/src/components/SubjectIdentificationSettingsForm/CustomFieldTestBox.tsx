import { useState } from 'react';

import { Input, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { CUSTOM_FIELD_MAX_VALUE_LENGTH } from '@opendatacapture/schemas/subject-identification';
import { normalizeCustomFieldValue } from '@opendatacapture/subject-utils';

type SampleVerdict = 'accepted' | 'no-pattern' | 'normalizes-to-nothing' | 'rejected' | 'too-long';

// In the order the forms refuse a value: its length as typed, then what is left once normalized,
// then the pattern, which tests the normalized value.
const judgeSample = (sample: string, normalized: string, compiledPattern: null | RegExp): SampleVerdict => {
  if (sample.length > CUSTOM_FIELD_MAX_VALUE_LENGTH) {
    return 'too-long';
  } else if (normalized === '') {
    return 'normalizes-to-nothing';
  } else if (compiledPattern === null) {
    return 'no-pattern';
  }
  return compiledPattern.test(normalized) ? 'accepted' : 'rejected';
};

export type CustomFieldTestBoxProps = {
  /** Null while the field's pattern is missing or does not compile. */
  compiledPattern: null | RegExp;
  /** The box's test ids are this followed by `-input`, `-result` and `-normalized`. */
  idPrefix: string;
};

/**
 * Shows what a typed value becomes and whether the pattern accepts it. Patterns see only uppercase
 * letters and digits, which is easy to forget without seeing a value go through.
 */
export const CustomFieldTestBox = ({ compiledPattern, idPrefix }: CustomFieldTestBoxProps) => {
  const { t } = useTranslation();
  const [sample, setSample] = useState('');

  const normalized = normalizeCustomFieldValue(sample);
  const verdict = judgeSample(sample, normalized, compiledPattern);
  const verdictMessages: { [K in SampleVerdict]: string } = {
    accepted: t({
      en: 'Accepted: the pattern matches this value.',
      es: 'Aceptado: el patrón coincide con este valor.',
      fr: 'Accepté : le motif correspond à cette valeur.'
    }),
    'no-pattern': t({
      en: 'Enter a valid pattern to test this value against it.',
      es: 'Introduzca un patrón válido para probar este valor.',
      fr: 'Saisissez un motif valide pour tester cette valeur.'
    }),
    'normalizes-to-nothing': t({
      en: 'Refused: this value has no letters or digits, so nothing is left once it is normalized.',
      es: 'Rechazado: este valor no tiene letras ni dígitos, por lo que no queda nada una vez normalizado.',
      fr: 'Refusé : cette valeur ne contient ni lettre ni chiffre, il ne reste donc rien une fois normalisée.'
    }),
    rejected: t({
      en: 'Rejected: the pattern does not match this value.',
      es: 'Rechazado: el patrón no coincide con este valor.',
      fr: 'Rejeté : le motif ne correspond pas à cette valeur.'
    }),
    'too-long': t(
      {
        en: 'Refused: a value is at most {} characters long.',
        es: 'Rechazado: un valor tiene como máximo {} caracteres.',
        fr: 'Refusé : une valeur compte au plus {} caractères.'
      },
      { args: [CUSTOM_FIELD_MAX_VALUE_LENGTH] }
    )
  };

  return (
    <div className="bg-muted/50 flex flex-col gap-2 rounded-md p-3">
      <Label htmlFor={`${idPrefix}-input`}>
        {t({ en: 'Test a Value', es: 'Probar un valor', fr: 'Tester une valeur' })}
      </Label>
      <p className="text-muted-foreground text-xs">
        {t({
          en: 'Type a value as staff would. It is uppercased and stripped of everything but letters and digits, as it will be when a subject is identified, and then tested against the pattern.',
          es: 'Escriba un valor como lo haría el personal. Se pasa a mayúsculas y se le quita todo lo que no sean letras y dígitos, como ocurrirá al identificar a un sujeto, y luego se prueba con el patrón.',
          fr: "Saisissez une valeur comme le ferait le personnel. Elle est mise en majuscules et débarrassée de tout ce qui n'est pas une lettre ou un chiffre, comme lors de l'identification d'un sujet, puis testée avec le motif."
        })}
      </p>
      <Input
        autoComplete="off"
        data-testid={`${idPrefix}-input`}
        id={`${idPrefix}-input`}
        value={sample}
        onChange={(event) => setSample(event.target.value)}
      />
      {sample !== '' && (
        <div className="flex flex-col gap-1 text-sm" data-testid={`${idPrefix}-result`} data-verdict={verdict}>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-muted-foreground">
              {t({ en: 'Normalized:', es: 'Normalizado:', fr: 'Normalisée :' })}
            </span>
            <code className="font-mono break-all" data-testid={`${idPrefix}-normalized`}>
              {normalized}
            </code>
          </div>
          <p
            className={cn('font-medium', {
              'text-destructive': verdict !== 'accepted' && verdict !== 'no-pattern',
              'text-green-600': verdict === 'accepted',
              'text-muted-foreground': verdict === 'no-pattern'
            })}
          >
            {verdictMessages[verdict]}
          </p>
        </div>
      )}
    </div>
  );
};
