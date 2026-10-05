import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentKind } from '@opendatacapture/runtime-core';

/**
 * Display labels for an instrument's kind, keyed by the stored value.
 *
 * Keyed over `InstrumentKind` rather than a loose record, so a kind added to the enum fails to
 * compile here instead of reaching the screen as its raw stored value.
 */
export function useInstrumentKindLabels(): { [K in InstrumentKind]: string } {
  const { t } = useTranslation();
  return {
    FILE: t({ en: 'File', es: 'Archivo', fr: 'Fichier' }),
    FORM: t({ en: 'Form', es: 'Formulario', fr: 'Formulaire' }),
    INTERACTIVE: t({ en: 'Interactive', es: 'Interactivo', fr: 'Interactif' }),
    SERIES: t({ en: 'Series', es: 'Serie', fr: 'Série' })
  };
}
