import { z } from 'zod';

type Config = z.infer<typeof $Config>;
const $Config = z.object({
  include: z.array(z.string()),
  mode: z.enum(['development', 'production']).optional(),
  outdir: z.string()
});

const $UserConfigs = z.union([$Config, z.array($Config)]);

export { $Config, $UserConfigs };
export type { Config };
