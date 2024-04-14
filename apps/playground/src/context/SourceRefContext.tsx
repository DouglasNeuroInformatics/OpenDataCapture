import React, { createContext, useRef } from 'react';

export const SourceRefContext = createContext<React.MutableRefObject<string>>(null!);

export const SourceRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sourceRef = useRef('');
  return <SourceRefContext.Provider value={sourceRef}>{children}</SourceRefContext.Provider>;
};
