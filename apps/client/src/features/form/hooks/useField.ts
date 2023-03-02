import { useContext, useState } from 'react';

import { FormContext } from '../context/FormContext';
import { FieldValue } from '../types';

export function useField<T extends HTMLElement & { value: string }, U extends FieldValue>(
  name: string
): {
  props: Pick<React.HTMLProps<T>, 'value' | 'onBlur' | 'onChange' | 'onFocus'>;
  helpers: {
    isFocused: boolean;
    setValue: (value: U) => void;
  };
} {
  const ctx = useContext(FormContext);
  const [isFocused, setIsFocused] = useState(false);

  return {
    props: {
      value: ctx.values[name] as U,
      onBlur: () => setIsFocused(false),
      onChange: (event: React.ChangeEvent<T>) => ctx.setValue(name, event.target.value),
      onFocus: () => setIsFocused(true)
    },
    helpers: {
      isFocused,
      setValue: (value: U) => ctx.setValue(name, value)
    }
  };
}
