import { z } from 'zod';

import type { Language } from './core.types';

/** Matches a 24 byte string, which corresponds to the size of a hex-encoded ObjectId */
export const validObjectIdSchema = z.string().refine((s) => new Blob([s]).size === 24);

export const languageSchema = z.enum(['en', 'fr']) satisfies Zod.ZodType<Language>;
