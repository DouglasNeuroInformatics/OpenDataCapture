import React, { createContext, useState } from 'react';

interface AuthContextInterface {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>;
};

export { AuthContext as default, AuthContextProvider, type AuthContextInterface };
