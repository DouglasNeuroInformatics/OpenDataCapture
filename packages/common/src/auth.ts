import { z } from 'zod';

import { userRoleOptions } from './users';

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

export const loginCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const jwtPayloadSchema = z.object({
  username: z.string(),
  role: z.enum(userRoleOptions),
  refreshToken: z.string().optional()
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
