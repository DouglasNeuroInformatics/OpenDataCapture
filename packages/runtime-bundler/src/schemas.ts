import { z } from 'zod';

const $Config = z.object({
  include: z.array(z.string()),
  minify: z.boolean().optional(),
  outdir: z.string()
});

type Config = z.infer<typeof $Config>;

export { $Config };
export type { Config };
