import { AuthTokens, LoginCredentials, userRoleOptions } from 'common';
import jwtDecode from 'jwt-decode';
import { z } from 'zod';
import { create } from 'zustand';

import AuthAPI from '@/api/auth.api';

const currentUserSchema = z.object({
  username: z.string(),
  role: z.enum(userRoleOptions)
});

type CurrentUser = z.infer<typeof currentUserSchema>;

interface Auth {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const useAuth = create<Auth>((set) => ({
  accessToken: null,
  login: async (credentials) => {
    let authTokens: AuthTokens;
    let currentUser: CurrentUser;
    try {
      authTokens = await AuthAPI.login(credentials);
      currentUser = await currentUserSchema.parseAsync(jwtDecode(authTokens.accessToken));
    } catch (error) {
      if (error instanceof Response) {
        throw new Error(`${error.status}: ${error.statusText}`);
      } else if (error instanceof z.ZodError) {
        throw new Error('Failed to validate current user schema', {
          cause: error
        });
      }
      throw new Error('An unknown error occurred');
    }
    set({ accessToken: authTokens.accessToken, currentUser });
  },
  currentUser: null,
  logout: () => set({ accessToken: null, currentUser: null })
}));

export default useAuth;

/*
export default function useAuth(): Auth {
  const context = useContext(AuthContext) as AuthContextInterface;
  const navigate = useNavigate();

  const accessToken = context.accessToken;

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
  }, [context]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
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
    },
    [context]
  );

  const loginDev = useCallback(() => {
    if (import.meta.env.VITE_DEV_BYPASS_AUTH) {
      void login({
        username: import.meta.env.VITE_DEV_USERNAME!,
        password: import.meta.env.VITE_DEV_PASSWORD!
      });
    }
  }, [login]);

  const logout = useCallback(() => {
    context.setAccessToken(null);
  }, [context]);

  useEffect(() => {
    // QUICK FIX FOR DEMO - FIX THIS BUG ASAP
    if (currentUser) {
      navigate('/home');
    }
  }, [currentUser]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      loginDev();
    }
  }, []);

  return {
    accessToken,
    currentUser,
    login,
    logout
  };
}
*/
