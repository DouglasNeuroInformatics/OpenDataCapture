import { useContext } from 'react';

import { NullablePrimitiveFieldValue } from '@/components';
import { FormContext } from '@/context/FormContext';

export function useFormField<T extends NullablePrimitiveFieldValue>(
  name: string
): {
  value: T;
  setValue: (value: T) => void;
} {
  const { values, setValues } = useContext(FormContext);

  return {
    value: values[name] as T,
    setValue: (value: T) => {
      setValues((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };
}
