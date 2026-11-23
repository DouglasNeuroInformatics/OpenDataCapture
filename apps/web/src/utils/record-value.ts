import { toBasicISOString } from '@douglasneuroinformatics/libjs';

const DAY_MS = 86_400_000;
const FIXED_COLUMN_PREFIX = '__';

const formatSet = (value: ReadonlySet<unknown>): string => Array.from(value, String).join(', ');

const isUTCMidnight = (date: Date): boolean => date.getTime() % DAY_MS === 0;

const replaceSet = (_key: string, nested: unknown): unknown => (nested instanceof Set ? formatSet(nested) : nested);

/** Collect every measure and user column key across a set of records, in first-seen order. */
export const extractRecordColumnKeys = (records: readonly { [key: string]: unknown }[]): string[] => {
  const keys = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!key.startsWith(FIXED_COLUMN_PREFIX)) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys);
};

/** Render a revived instrument record value as the text of a single table cell. */
export const formatRecordValue = (value: unknown): string => {
  if (value === undefined) {
    return '';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }
  if (value instanceof Set) {
    return formatSet(value);
  }
  if (value instanceof Date) {
    return value.toString();
  }
  return JSON.stringify(value, replaceSet);
};

/** Format a revived record field for a wide or long tabular export cell. */
export const serializeExportValue = (value: unknown): boolean | null | number | string => {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return isUTCMidnight(value) ? toBasicISOString(value) : value.toISOString();
  }
  if (value instanceof Set) {
    return formatSet(value);
  }
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value, replaceSet);
};
