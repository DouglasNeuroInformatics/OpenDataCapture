import { cn } from '@douglasneuroinformatics/libui/utils';

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

/**
 * A compact tab-style toggle for a small set of mutually exclusive options. The
 * selected segment is tinted with the primary palette (matching the app's primary
 * buttons), the rest are muted and highlight on hover.
 */
export const SegmentedControl = <T extends string>({
  ariaLabel,
  className,
  onChange,
  options,
  value
}: {
  ariaLabel?: string;
  className?: string;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  value: T;
}) => {
  return (
    <div
      aria-label={ariaLabel}
      className={cn('inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-700/40', className)}
      role="radiogroup"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            aria-checked={selected}
            className={cn(
              'flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
            key={option.value}
            role="radio"
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
