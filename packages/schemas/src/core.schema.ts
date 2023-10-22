import { z } from 'zod';

/** Matches a 24 byte string, which corresponds to the size of a hex-encoded ObjectId */
export const validObjectIdSchema = z.string().refine((s) => Buffer.byteLength(s) === 24);
