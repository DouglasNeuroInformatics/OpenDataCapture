import React, { createContext, useState } from 'react';

interface AuthContextInterface {
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  return <AuthContext.Provider value={{ accessToken, setAccessToken }}>{children}</AuthContext.Provider>;
};

export { AuthContext as default, AuthContextProvider, type AuthContextInterface };
