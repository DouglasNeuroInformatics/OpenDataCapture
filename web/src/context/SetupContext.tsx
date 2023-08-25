import React, { createContext, useEffect, useState } from 'react';

import { SetupState } from '@ddcp/types';
import axios from 'axios';

export const SetupContext = createContext<SetupState>(null!);

export const SetupContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SetupState>(() => {
    const savedSetup = window.localStorage.getItem('setup');
    if (!savedSetup) {
      return { isSetup: null };
    }
    return JSON.parse(savedSetup) as SetupState;
  });

  useEffect(() => {
    if (state.isSetup === null) {
      axios
        .get<SetupState>('/v1/setup')
        .then((response) => {
          window.localStorage.setItem('setup', JSON.stringify(response.data));
          setState(response.data);
        })
        .catch(console.error);
    }
  }, [state, setState]);

  return <SetupContext.Provider value={state}>{children}</SetupContext.Provider>;
};
