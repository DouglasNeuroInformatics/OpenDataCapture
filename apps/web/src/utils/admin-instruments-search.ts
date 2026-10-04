import { z } from 'zod/v4';

export type AdminInstrumentsSearch = z.infer<typeof $AdminInstrumentsSearch>;
// Optional rather than defaulted, so a bare `/admin/instruments` opens the forms view without the router
// rewriting the address to add `?view=forms`.
export const $AdminInstrumentsSearch = z.object({ view: z.enum(['forms', 'series']).optional().catch(undefined) });
