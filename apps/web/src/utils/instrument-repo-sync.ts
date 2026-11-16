import type { InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';

type InstrumentRepoSyncStatus = 'FAILED' | 'PARTIAL' | 'SUCCESS';

/**
 * A sync that could not read the repository failed outright; one that stored some of its instruments
 * and skipped others partly succeeded. Skipping every instrument is not a partial success: the
 * repository was readable, but nothing was imported, so there is no success for the failures to be
 * part of.
 */
function getSyncStatus(log: InstrumentRepoSyncLog): InstrumentRepoSyncStatus {
  if (log.message) {
    return 'FAILED';
  }
  if (!log.failures.length) {
    return 'SUCCESS';
  }
  return log.importedCount > 0 ? 'PARTIAL' : 'FAILED';
}

export { getSyncStatus, type InstrumentRepoSyncStatus };
