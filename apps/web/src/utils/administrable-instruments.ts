import type { InstrumentKind } from '@opendatacapture/runtime-core';

type AdministrableCandidate = {
  archivedAt?: Date | null;
  id: string;
  kind: InstrumentKind;
};

/**
 * The instruments that may be started or assigned now: those the current group has opted into, less
 * any series an administrator has archived. Without a current group, every instrument qualifies. Only
 * pickers for new sessions and assignments filter this way — anything showing collected data must
 * keep archived series, whose records are unaffected.
 */
function selectAdministrableInstruments<TInstrument extends AdministrableCandidate>(
  instruments: TInstrument[],
  currentGroup: null | { accessibleInstrumentIds: string[] }
): TInstrument[] {
  return instruments.filter((instrument) => {
    if (instrument.kind === 'SERIES' && instrument.archivedAt) {
      return false;
    }
    return !currentGroup || currentGroup.accessibleInstrumentIds.includes(instrument.id);
  });
}

/**
 * The administrable instruments that may also be assigned remotely: the gateway has no way to
 * deliver a patient's uploads, so a file instrument is administered in person only. A series with a
 * file item is left for the API to refuse, because an item pinned to an older edition is absent from
 * the instrument list, so its kind cannot be known here.
 */
function selectRemotelyAssignableInstruments<TInstrument extends AdministrableCandidate>(
  instruments: TInstrument[],
  currentGroup: null | { accessibleInstrumentIds: string[] }
): TInstrument[] {
  return selectAdministrableInstruments(instruments, currentGroup).filter(({ kind }) => kind !== 'FILE');
}

export { selectAdministrableInstruments, selectRemotelyAssignableInstruments };
