import React from 'react';

import { useFieldArray } from 'react-hook-form';

import { FormDataRecord } from '../types';

export interface ArrayFieldProps<T extends FormDataRecord[]> {
  kind: 'array';
  name: string;
}

export const ArrayField = <T extends FormDataRecord[]>({ name }: ArrayFieldProps<T>) => {
  /*
  const { fields, append, remove } = useFieldArray<T>({
    name: name
  }); */

  return null;
};
