import { useContext } from 'react';

import { SourceRefContext } from '@/context/SourceRefContext';

export function useSourceRef() {
  return useContext(SourceRefContext);
}
