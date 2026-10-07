type ColorTagCellProps = {
  color: string;
  'data-testid'?: string;
  label: string;
};

/**
 * A table cell tagging a nominal value with a colour: a dot carrying the colour, and the name beside
 * it in ordinary ink.
 *
 * The colour is always redundant — the label is right there — which is what keeps it readable for a
 * colourblind user and why the text itself is never tinted. The label clips rather than wrapping, so
 * one long value cannot make every row in the table taller.
 */
export const ColorTagCell = ({ color, 'data-testid': testId, label }: ColorTagCellProps) => (
  <span className="flex items-center gap-1.5 overflow-hidden" data-testid={testId} title={label}>
    {/* The hairline ring is what lets a pastel fill stay visible against a light surface, where a
        bare dot of it would sit near 1.5:1 and effectively disappear. */}
    <span
      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/20 dark:ring-white/25"
      style={{ backgroundColor: color }}
    />
    <span className="truncate">{label}</span>
  </span>
);
