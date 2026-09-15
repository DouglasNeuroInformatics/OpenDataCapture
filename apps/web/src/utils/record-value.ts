/** Render a revived instrument record value as the text of a single table cell. */
export const formatRecordValue = (value: unknown): string => {
  if (value instanceof Set) {
    return Array.from(value, String).join(', ');
  }
  return String(value);
};
