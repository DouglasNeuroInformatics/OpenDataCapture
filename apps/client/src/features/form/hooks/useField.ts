import { useContext } from 'react';

import { FormContext } from '../context/FormContext';
import { FieldValue } from '../types';

export function useField<T extends FieldValue>(name: string) {
  const ctx = useContext(FormContext);
  return {
    value: ctx.values[name] as T,
    setValue: (value: T) => ctx.onChange(name, value)
  };
}
