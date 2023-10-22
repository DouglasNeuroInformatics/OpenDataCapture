import type { LoginCredentials } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

export const loginCredentialsSchema = z.object({
  password: z.string(),
  username: z.string()
}) satisfies ZodType<LoginCredentials>;
