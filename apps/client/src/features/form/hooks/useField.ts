import { ChangeEvent, useContext, useState } from 'react';

import { FormContext } from '../context/FormContext';
import { FieldValue } from '../types';

type FieldElement = HTMLInputElement & HTMLTextAreaElement;

export function useField<T extends FieldValue>(name: string) {
  const ctx = useContext(FormContext);
  const [isFocused, setIsFocused] = useState(false);

  return {
    isFocused,
    value: ctx.values[name] as T,
    onBlur: () => setIsFocused(false),
    onChange: (event: ChangeEvent<FieldElement>) => ctx.setValue(name, event.target.value),
    onFocus: () => setIsFocused(true)
  };
}
