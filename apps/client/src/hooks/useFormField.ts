import { useContext } from 'react';

import { NullablePrimitiveFieldValue } from '@/components';
import { FormContext } from '@/context/FormContext';

export function useFormField<T extends NullablePrimitiveFieldValue>(
  name: string
): {
  value: T;
  // setValues: any;
} {
  const form = useContext(FormContext);
  return {
    value: form.values[name] as T
  };
}
