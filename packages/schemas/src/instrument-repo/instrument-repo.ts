import { z } from 'zod/v4';

import { $BaseModel } from '../core/core.js';

export type InstrumentRepo = z.infer<typeof $InstrumentRepo>;
export const $InstrumentRepo = $BaseModel.extend({
  groupIds: z.array(z.string()),
  instrumentIds: z.array(z.string()),
  lastSyncedAt: z.coerce.date().nullish(),
  name: z.string().min(1),
  owner: z.string().min(1),
  repoName: z.string().min(1),
  url: z.string().url()
});

export type CreateInstrumentRepoData = z.infer<typeof $CreateInstrumentRepoData>;
export const $CreateInstrumentRepoData = z.object({
  // Optional GitHub personal access token, required only for private repositories. It is stored
  // encrypted on the server and never returned to the client.
  accessToken: z.string().min(1).optional(),
  url: z
    .string()
    .url()
    .regex(/^https:\/\/github\.com\/[^/]+\/[^/]+(\.git)?\/?$/, 'Must be a valid GitHub repository URL')
});
