/** A named window over the collection date, or an explicit one the user typed */
type CollectedPreset =
  'all' | 'custom' | 'pastMonth' | 'pastSixMonths' | 'pastThreeMonths' | 'pastTwoYears' | 'pastWeek' | 'pastYear';

type CollectedFilter = {
  max: Date | null;
  min: Date | null;
  preset: CollectedPreset;
};

const DEFAULT_COLLECTED_FILTER: CollectedFilter = { max: null, min: null, preset: 'all' };

/** The earliest date a preset admits, or null for no lower bound */
function presetMinDate(preset: CollectedPreset): Date | null {
  const now = new Date();
  const monthsAgo = (count: number) => new Date(new Date(now).setMonth(now.getMonth() - count));
  const yearsAgo = (count: number) => new Date(new Date(now).setFullYear(now.getFullYear() - count));
  switch (preset) {
    case 'pastMonth':
      return monthsAgo(1);
    case 'pastSixMonths':
      return monthsAgo(6);
    case 'pastThreeMonths':
      return monthsAgo(3);
    case 'pastTwoYears':
      return yearsAgo(2);
    case 'pastWeek':
      return new Date(new Date(now).setDate(now.getDate() - 7));
    case 'pastYear':
      return yearsAgo(1);
    default:
      return null;
  }
}

/**
 * Whether a row's collection date falls in the chosen window. A row with nothing collected cannot
 * satisfy a window, but must survive "any time".
 */
function matchesCollectedFilter(value: Date | null | undefined, filter: CollectedFilter): boolean {
  if (!value) {
    return filter.preset === 'all';
  }
  if (filter.min && value < filter.min) {
    return false;
  }
  return !(filter.max && value > filter.max);
}

/**
 * The filter a preset selection produces. A preset owns both bounds; only `custom` leaves them to
 * the user, and it starts from whatever window the preset had so the dates are a nudge, not blank.
 */
function selectCollectedPreset(preset: CollectedPreset, previous: CollectedFilter): CollectedFilter {
  return {
    max: preset === 'custom' ? previous.max : null,
    min: preset === 'custom' ? (previous.min ?? presetMinDate(previous.preset)) : presetMinDate(preset),
    preset
  };
}

export { DEFAULT_COLLECTED_FILTER, matchesCollectedFilter, presetMinDate, selectCollectedPreset };
export type { CollectedFilter, CollectedPreset };
