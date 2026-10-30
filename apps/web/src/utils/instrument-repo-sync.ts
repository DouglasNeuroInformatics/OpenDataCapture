import type { InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';

type InstrumentRepoSyncStatus = 'FAILED' | 'PARTIAL' | 'SUCCESS';

/** A sync that could not read the repository failed outright; one that skipped instruments partly succeeded. */
function getSyncStatus(log: InstrumentRepoSyncLog): InstrumentRepoSyncStatus {
  if (log.message) {
    return 'FAILED';
  }
  return log.failures.length ? 'PARTIAL' : 'SUCCESS';
}

export { getSyncStatus, type InstrumentRepoSyncStatus };
