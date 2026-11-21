import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';

import { getValueForLanguage } from '@/utils/language';

/**
 * The identification methods the instance offers, as a select's options in the reader's language,
 * and the method a form opens on: the one preferred while it is offered, else the first offered.
 */
export function useSubjectIdentificationMethodOptions({
  customFields,
  offeredMethods
}: Pick<SubjectIdentificationSettings, 'customFields' | 'offeredMethods'>) {
  const { resolvedLanguage, t } = useTranslation();
  const labels: { [K in SubjectIdentificationMethod]: string } = {
    // Offered only while defined, so the empty label is never shown.
    CUSTOM_FIELDS: (customFields && getValueForLanguage(customFields.label, resolvedLanguage)) ?? '',
    CUSTOM_ID: t('common.customIdentifier'),
    PERSONAL_INFO: t('common.personalInfo')
  };
  return {
    options: Object.fromEntries(offeredMethods.map((method) => [method, labels[method]])),
    preferMethod: (method: null | SubjectIdentificationMethod | undefined): SubjectIdentificationMethod => {
      return method && offeredMethods.includes(method) ? method : offeredMethods[0];
    }
  };
}
