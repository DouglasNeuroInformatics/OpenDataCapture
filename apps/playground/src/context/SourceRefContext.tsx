import React, { createContext, useRef } from 'react';

import { useInstrumentStore } from '@/store/instrument.store';

export const SourceRefContext = createContext<React.MutableRefObject<string>>(null!);

export const SourceRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultInstrument = useInstrumentStore((store) => store.defaultInstrument);
  const sourceRef = useRef(defaultInstrument.source);
  return <SourceRefContext.Provider value={sourceRef}>{children}</SourceRefContext.Provider>;
};
