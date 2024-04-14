import { createContext } from 'react';

export const SourceRefContext = createContext<React.MutableRefObject<string>>(null!);
