import { useContext, useEffect, useMemo } from 'react';

import { AuthTokens, LoginCredentials, userRoles } from 'common';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import AuthAPI from '@/api/auth.api';
import AuthContext, { AuthContextInterface } from '@/context/AuthContext';

const currentUserSchema = z.object({
  username: z.string(),
  role: z.enum(userRoles)
});

type CurrentUser = z.infer<typeof currentUserSchema>;

interface Auth {
  currentUser: CurrentUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  //loginDev: () => Promise<void>;
  //logout: () => void;
}

export default function useAuth(): Auth {
  const context = useContext(AuthContext) as AuthContextInterface;
  const navigate = useNavigate();

  const currentUser: CurrentUser | null = useMemo(() => {
    if (context.accessToken) {
      const result = currentUserSchema.safeParse(jwtDecode(context.accessToken));
      if (result.success) {
        return result.data;
      }
      console.error('Failed to parse current user from access token');
      console.error(result.error);
    }
    return null;
  }, [context.accessToken]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    let authTokens: AuthTokens;
    try {
      authTokens = await AuthAPI.login(credentials);
      context.setAccessToken(authTokens.accessToken);
    } catch (error) {
      if (error instanceof Response) {
        throw new Error(`${error.status}: ${error.statusText}`);
      }
      throw new Error('An unknown error occurred');
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate('/home');
    }
  }, [currentUser]);

  return {
    currentUser,
    login
  };
}
