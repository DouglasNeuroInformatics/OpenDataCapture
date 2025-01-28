/** @public */
type Language = 'en' | 'fr';

/** @public */
type JsonLiteral = boolean | null | number | string;

/** @public */
type Json = { [key: string]: Json } | Json[] | JsonLiteral;

export type { Json, JsonLiteral, Language };
