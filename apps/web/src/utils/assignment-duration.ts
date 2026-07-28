import { DEFAULT_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/assignment';
import { MAX_ASSIGNMENT_DURATION_DAYS } from '@opendatacapture/schemas/setup';

const MS_PER_DAY = 86_400_000;

/** Returns the whole-day count if `raw` is a valid duration, otherwise null. */
export const parseDurationDays = (raw: string): null | number => {
  const parsed = Number(raw);
  const isValid =
    raw.trim() !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_ASSIGNMENT_DURATION_DAYS;
  return isValid ? parsed : null;
};

/** The expiry applied to a new remote assignment, from the instance default or the built-in fallback. */
export const getDefaultAssignmentExpiry = (
  defaultAssignmentDurationDays: null | number | undefined,
  now = Date.now()
): Date => {
  const durationDays = defaultAssignmentDurationDays ?? DEFAULT_ASSIGNMENT_DURATION_DAYS;
  return new Date(now + durationDays * MS_PER_DAY);
};
