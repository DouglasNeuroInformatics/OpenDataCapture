import { useEffect, useRef } from 'react';

import { useAppStore } from '@/store';

export function useEditorFilesRef() {
  const ref = useRef(useAppStore.getState().files);
  useEffect(() => {
    useAppStore.subscribe(
      (store) => store.files,
      (files) => {
        ref.current = files;
      }
    );
  }, []);
  return ref;
}
