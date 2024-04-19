import { useEffect, useRef } from 'react';

import { useEditorStore } from '@/store/editor.store';

export function useEditorFilesRef() {
  const ref = useRef(useEditorStore.getState().files);
  useEffect(() => {
    useEditorStore.subscribe(
      (store) => store.files,
      (files) => {
        ref.current = files;
      }
    );
  }, []);
  return ref;
}
