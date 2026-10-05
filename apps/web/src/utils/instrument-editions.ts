import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';

type EditionedInstrument = {
  internal: { edition: number; name: string };
};

/**
 * Every edition of the instrument the given id names, as dropdown options keyed by instrument id.
 *
 * Editions are a property of a scalar instrument's `internal.name`, so a series — which has no
 * `internal` at all — offers none. Ordered by edition rather than by the catalog's own order.
 */
function getEditionOptions(
  infos: TranslatedInstrumentInfo[],
  instrumentId: null | string,
  editionLabel: string
): { [id: string]: string } {
  const selected = infos.find((info) => info.id === instrumentId);
  if (!selected || selected.kind === 'SERIES') {
    return {};
  }
  const selectedName = selected.internal.name;
  const options: { [id: string]: string } = {};
  infos
    .filter((info): info is typeof selected => info.kind !== 'SERIES' && info.internal.name === selectedName)
    .sort((a, b) => a.internal.edition - b.internal.edition)
    .forEach((info) => {
      options[info.id] = `${editionLabel} ${info.internal.edition}`;
    });
  return options;
}

/** The highest edition of each instrument, in the order each name first appears. */
function selectLatestEditions<TInstrument extends EditionedInstrument>(instruments: TInstrument[]): TInstrument[] {
  const latestByName = new Map<string, TInstrument>();
  for (const instrument of instruments) {
    const current = latestByName.get(instrument.internal.name);
    if (!current || instrument.internal.edition > current.internal.edition) {
      latestByName.set(instrument.internal.name, instrument);
    }
  }
  return [...latestByName.values()];
}

export { getEditionOptions, selectLatestEditions };
