import { useContext } from 'react';

import { NullablePrimitiveFieldValue } from '@/components';
import { FormContext } from '@/context/FormContext';

export function useFormField<T extends NullablePrimitiveFieldValue>(
  name: string
): {
  error?: string;
  value: T;
  setValue: (value: T) => void;
} {
  const { errors, values, setValues } = useContext(FormContext);

  // Because we use generic by default with context - later extract to hook
  const error = errors[name] as any as string;

  return {
    error: error,
    value: values[name] as T,
    setValue: (value: T) => {
      setValues((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };
}
