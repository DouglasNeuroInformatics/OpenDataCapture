import { isEqual, isEqualWith } from 'lodash-es';

const isStringList = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

/** A list of strings is a list of ids here, and one that is only reordered has not changed. */
const compareStringListsAsSets = (value: unknown, other: unknown): boolean | undefined => {
  if (isStringList(value) && isStringList(other)) {
    return isEqual(value.toSorted(), other.toSorted());
  }
  return undefined;
};

const fieldValues = (value: unknown): Map<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError(`Cannot name the changed fields of ${String(value)}, which has no fields`);
  }
  return new Map(Object.entries(value));
};

/**
 * The names of the fields that differ between a row, or a record's data, before and after an
 * update, sorted.
 */
export function changedFields(before: unknown, after: unknown): string[] {
  const beforeValues = fieldValues(before);
  const afterValues = fieldValues(after);
  const fields = new Set([...beforeValues.keys(), ...afterValues.keys()]);
  // Every write sets it, so it would name every update as a change.
  fields.delete('updatedAt');
  return [...fields]
    .filter((field) => !isEqualWith(beforeValues.get(field), afterValues.get(field), compareStringListsAsSets))
    .sort();
}
