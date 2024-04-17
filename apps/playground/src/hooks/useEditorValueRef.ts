import { useEffect, useRef } from 'react';

import { useEditorStore } from '@/store/editor.store';

export function useEditorValueRef() {
  const ref = useRef(useEditorStore.getState().value);
  useEffect(
    () =>
      useEditorStore.subscribe((state) => {
        ref.current = state.value;
      }),
    []
  );
  return ref;
}
