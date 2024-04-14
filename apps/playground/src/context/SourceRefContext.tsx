import React, { createContext, useRef } from 'react';

import { DEFAULT_INSTRUMENT } from '@/store/instrument.store';

export const SourceRefContext = createContext<React.MutableRefObject<string>>(null!);

export const SourceRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sourceRef = useRef(DEFAULT_INSTRUMENT.source);
  return <SourceRefContext.Provider value={sourceRef}>{children}</SourceRefContext.Provider>;
};
