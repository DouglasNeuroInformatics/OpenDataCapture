import type { InstrumentKind } from '@opendatacapture/runtime-core';

/**
 * Which groups may administer a series: every group on the instance, or only the group that owns it.
 * `name` is null for a series owned by some group other than the current one — the info endpoint is
 * scoped to one group and so never reports such a series today, but naming the current group for it
 * would be a lie rather than a gap.
 */
type SeriesAvailability = { kind: 'all' } | { kind: 'group'; name: null | string };

/** Null for a scalar instrument, which is never owned by a group. */
function buildSeriesAvailability({
  currentGroup,
  instrumentKind,
  seriesGroupId
}: {
  currentGroup?: null | { id: string; name: string };
  instrumentKind: InstrumentKind;
  seriesGroupId: null | string;
}): null | SeriesAvailability {
  if (instrumentKind !== 'SERIES') {
    return null;
  }
  if (seriesGroupId === null) {
    return { kind: 'all' };
  }
  return { kind: 'group', name: seriesGroupId === currentGroup?.id ? currentGroup.name : null };
}

export type { SeriesAvailability };

export { buildSeriesAvailability };
