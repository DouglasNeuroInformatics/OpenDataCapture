import { isEqual } from 'lodash-es';

type RowWithIdLists<TIdListField extends string> = { [field: string]: unknown; updatedAt: Date } & {
  [TField in TIdListField]: string[];
};

const fieldValues = (value: unknown): Map<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError(`Cannot name the changed fields of ${String(value)}, which has no fields`);
  }
  return new Map(Object.entries(value));
};

const namesOfChangedFields = (before: Map<string, unknown>, after: Map<string, unknown>): string[] => {
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter((field) => !isEqual(before.get(field), after.get(field)))
    .sort();
};

/** Every value is compared as it is, order included, because the data is what the instrument collected. */
export function changedDataFields(before: unknown, after: unknown): string[] {
  return namesOfChangedFields(fieldValues(before), fieldValues(after));
}

/**
 * The web forms resubmit every field and rebuild each id list in their own order, so an id list that
 * holds the same ids is unchanged; `updatedAt` is left out, since every write sets it.
 */
export function changedRowFields<TIdListField extends string>(
  before: RowWithIdLists<TIdListField>,
  after: RowWithIdLists<TIdListField>,
  idListFields: readonly TIdListField[]
): string[] {
  const rowValues = (row: RowWithIdLists<TIdListField>) => {
    const values = fieldValues(row);
    values.delete('updatedAt');
    idListFields.forEach((field) => values.set(field, row[field].toSorted()));
    return values;
  };
  return namesOfChangedFields(rowValues(before), rowValues(after));
}
