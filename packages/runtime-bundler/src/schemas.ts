import { z } from 'zod/v4';

type Config = z.infer<typeof $Config>;
const $Config = z.object({
  include: z.array(z.string()),
  mode: z.enum(['development', 'production']).optional(),
  outdir: z.string()
});

export { $Config };
export type { Config };
