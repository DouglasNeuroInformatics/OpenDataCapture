/** @public */
type Language = 'en' | 'fr';

/** @public */
type JsonLiteral = boolean | null | number | string;

/** @public */
type Json = Json[] | JsonLiteral | { [key: string]: Json };

export type { Json, JsonLiteral, Language };
