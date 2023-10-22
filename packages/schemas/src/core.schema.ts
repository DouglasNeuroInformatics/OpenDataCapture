import type { Language } from '@open-data-capture/types';
import { type ZodType, z } from 'zod';

/** Matches a 24 byte string, which corresponds to the size of a hex-encoded ObjectId */
export const validObjectIdSchema = z.string().refine((s) => Buffer.byteLength(s) === 24);

export const languageSchema = z.enum(['en', 'fr']) satisfies ZodType<Language>;
