import { Select } from '@douglasneuroinformatics/libui/components';

type CellSelectProps = {
  disabled?: boolean;
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  options: { [key: string]: string };
  placeholder: string;
  value: string | undefined;
};

/** A select drawn flat into a table cell. Its test ids follow libui's form select, keyed on `name`. */
export const CellSelect = ({ disabled, label, name, onValueChange, options, placeholder, value }: CellSelectProps) => (
  <Select disabled={disabled} name={name} value={value ?? ''} onValueChange={onValueChange}>
    <Select.Trigger
      aria-label={label}
      className="data-placeholder:text-muted-foreground h-auto min-w-0 border-0 bg-transparent px-0 py-0 shadow-none [&>span]:block [&>span]:min-w-0 [&>span]:truncate"
      data-testid={`${name}-select-trigger`}
    >
      <Select.Value placeholder={placeholder} />
    </Select.Trigger>
    <Select.Content data-testid={`${name}-select-content`}>
      {Object.entries(options).map(([key, optionLabel]) => (
        <Select.Item data-testid={`${name}-select-item-${key}`} key={key} value={key}>
          {optionLabel}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);
