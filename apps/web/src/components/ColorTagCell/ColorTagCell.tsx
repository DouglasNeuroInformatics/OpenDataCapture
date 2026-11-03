import type { TableColorMode } from '@opendatacapture/schemas/setup';

import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import type { TagColor } from '@/utils/tag-colors';

type ColorTagProps = {
  color: TagColor;
  'data-archived'?: 'false' | 'true';
  'data-testid'?: string;
  label: string;
  mode: TableColorMode;
};

/**
 * A nominal value drawn in one of the instance's table colour modes: a dot beside the name in ordinary
 * ink, the name itself tinted, or the name alone. The label clips rather than wrapping, so one long
 * value cannot make every row in a table taller.
 */
const ColorTag = ({ color, label, mode, ...dataAttributes }: ColorTagProps) => (
  <span className="flex items-center gap-1.5 overflow-hidden" title={label} {...dataAttributes}>
    {mode === 'tags' && (
      // The hairline ring is what lets a pastel fill stay visible against a light surface, where a
      // bare dot of it would sit near 1.5:1 and effectively disappear.
      <span
        className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/20 dark:ring-white/25"
        data-testid="color-tag-dot"
        style={{ backgroundColor: color.fill }}
      />
    )}
    <span
      className="truncate"
      data-testid="color-tag-label"
      style={mode === 'text' ? { color: color.text } : undefined}
    >
      {label}
    </span>
  </span>
);

type ColorTagCellProps = Omit<ColorTagProps, 'mode'>;

/** A table cell tagging a nominal value with a colour, drawn in the mode the admin chose. */
const ColorTagCell = (props: ColorTagCellProps) => {
  const { data } = useSetupStateQuery();
  return <ColorTag mode={data.tableColorMode} {...props} />;
};

export { ColorTag, ColorTagCell };
