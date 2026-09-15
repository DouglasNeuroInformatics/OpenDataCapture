import { Button, DropdownMenu } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { ChevronDownIcon } from 'lucide-react';

type FilterMenuOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type FilterMenuProps<TValue extends string> = {
  /** The option that clears the filter, e.g. "All groups" */
  allLabel: string;
  'data-testid'?: string;
  label: string;
  onValueChange: (value: TValue | undefined) => void;
  options: FilterMenuOption<TValue>[];
  value: TValue | undefined;
};

/** Radix requires a string for the "all" radio item, so the cleared state is the one value no option may have */
const CLEARED_VALUE = '';

/**
 * A single-select filter that reads as a button: the facet name alone when nothing is selected,
 * the facet name and the selected option once something is.
 */
export const FilterMenu = <TValue extends string>({
  allLabel,
  label,
  onValueChange,
  options,
  value,
  ...props
}: FilterMenuProps<TValue>) => {
  const selected = options.find((option) => option.value === value);
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          className={cn('gap-1.5 font-normal', selected && 'bg-accent text-accent-foreground')}
          data-active={Boolean(selected)}
          data-testid={props['data-testid']}
          variant="outline"
        >
          <span className="text-muted-foreground">{label}</span>
          {selected && <span className="max-w-48 truncate font-medium">{selected.label}</span>}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="max-h-80 w-56 overflow-y-auto">
        <DropdownMenu.RadioGroup
          value={selected?.value ?? CLEARED_VALUE}
          onValueChange={(next) => onValueChange(options.find((option) => option.value === next)?.value)}
        >
          <DropdownMenu.RadioItem value={CLEARED_VALUE}>{allLabel}</DropdownMenu.RadioItem>
          <DropdownMenu.Separator />
          {options.map((option) => (
            <DropdownMenu.RadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
