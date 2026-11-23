const FIXED_COLUMN_PREFIX = '__';

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
    return Array.from(value, String).join(', ');
  }
  if (value instanceof Date) {
    return value.toString();
  }
  return JSON.stringify(value);
};
