import { z } from 'zod';

import type { LoginCredentials } from './auth.types';

export const loginCredentialsSchema = z.object({
  password: z.string(),
  username: z.string()
}) satisfies Zod.ZodType<LoginCredentials>;
