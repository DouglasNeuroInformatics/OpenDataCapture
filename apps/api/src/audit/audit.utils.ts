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

/** The names of the fields that differ between a row before and after an update, sorted. */
export function changedFields(before: object, after: object): string[] {
  const beforeValues = new Map<string, unknown>(Object.entries(before));
  const afterValues = new Map<string, unknown>(Object.entries(after));
  const fields = new Set([...beforeValues.keys(), ...afterValues.keys()]);
  // Every write sets it, so it would name every update as a change.
  fields.delete('updatedAt');
  return [...fields]
    .filter((field) => !isEqualWith(beforeValues.get(field), afterValues.get(field), compareStringListsAsSets))
    .sort();
}
