import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { SessionType } from '@opendatacapture/schemas/session';

/**
 * Display labels for a record's data collection method, keyed by the stored value.
 *
 * Reuses the copy the session form already shows for the same concept, so a session started as
 * "In-Person" is not later described with a different word in the datahub.
 */
export function useCollectionMethodLabels(): { [K in SessionType]: string } {
  const { t } = useTranslation();
  return {
    IN_PERSON: t('session.type.in-person'),
    REMOTE: t('session.type.remote'),
    RETROSPECTIVE: t('session.type.retrospective')
  };
}
