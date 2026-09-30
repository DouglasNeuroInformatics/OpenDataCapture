type EditionedInstrument = {
  internal: { edition: number; name: string };
};

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

export { selectLatestEditions };
