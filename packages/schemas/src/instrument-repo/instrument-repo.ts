import { z } from 'zod/v4';

import { $BaseModel, $DateLike } from '../core/core.js';

export type InstrumentRepo = z.infer<typeof $InstrumentRepo>;
export const $InstrumentRepo = $BaseModel.extend({
  groupIds: z.array(z.string()),
  instrumentIds: z.array(z.string()),
  lastSyncedAt: $DateLike.nullish(),
  name: z.string().min(1),
  owner: z.string().min(1),
  repoName: z.string().min(1),
  url: z.string().url()
});

export type $CreateInstrumentRepoData = z.infer<typeof $CreateInstrumentRepoData>;
export const $CreateInstrumentRepoData = z.object({
  // Optional GitHub personal access token, required only for private repositories. It is stored
  // encrypted on the server and never returned to the client.
  accessToken: z.string().min(1).optional(),
  url: z
    .string()
    .url()
    .regex(/^https:\/\/github\.com\/[^/]+\/[^/]+(\.git)?\/?$/, 'Must be a valid GitHub repository URL')
});

export type InstrumentRepoSyncAction = z.infer<typeof $InstrumentRepoSyncAction>;
export const $InstrumentRepoSyncAction = z.enum(['IMPORT', 'SYNC']);

/** `BUNDLE`: the source could not be compiled. `LOAD`: the bundle compiled but the server refused it. */
export type InstrumentRepoSyncStage = z.infer<typeof $InstrumentRepoSyncStage>;
export const $InstrumentRepoSyncStage = z.enum(['BUNDLE', 'LOAD']);

export type InstrumentRepoSyncFailure = z.infer<typeof $InstrumentRepoSyncFailure>;
export const $InstrumentRepoSyncFailure = z.object({
  instrumentDir: z.string(),
  message: z.string(),
  stage: $InstrumentRepoSyncStage
});

export type InstrumentRepoSyncLog = z.infer<typeof $InstrumentRepoSyncLog>;
export const $InstrumentRepoSyncLog = $BaseModel.extend({
  action: $InstrumentRepoSyncAction,
  failures: z.array($InstrumentRepoSyncFailure),
  importedCount: z.number().int().nonnegative(),
  /** Set when the repository as a whole could not be read, in which case nothing was imported. */
  message: z.string().nullish(),
  /** Null when importing a repository that was never created because its download failed. */
  repoId: z.string().nullish(),
  repoName: z.string()
});
