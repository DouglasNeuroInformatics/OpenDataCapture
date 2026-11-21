/**
 * Order entries alphabetically by the label a reader sees. Sorting the translated label rather than
 * keeping the order the entries were written in is what keeps a list scannable in every language.
 */
export const sortByLabel = <TEntry extends { label: string }>(entries: readonly TEntry[]): TEntry[] => {
  return entries.toSorted((a, b) => a.label.localeCompare(b.label));
};
