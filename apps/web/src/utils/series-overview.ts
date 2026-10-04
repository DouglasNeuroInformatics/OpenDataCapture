type SeriesOverviewRow = {
  archivedAt?: Date | null;
  groupName: null | string;
  title: string;
};

/**
 * Active series before archived ones; within each, grouped by owner with the series every group shares
 * first, then alphabetically by title.
 */
function sortSeriesOverviewRows<TRow extends SeriesOverviewRow>(rows: TRow[]): TRow[] {
  return rows.toSorted(
    (a, b) =>
      Number(Boolean(a.archivedAt)) - Number(Boolean(b.archivedAt)) ||
      Number(a.groupName !== null) - Number(b.groupName !== null) ||
      (a.groupName ?? '').localeCompare(b.groupName ?? '') ||
      a.title.localeCompare(b.title)
  );
}

export type { SeriesOverviewRow };

export { sortSeriesOverviewRows };
