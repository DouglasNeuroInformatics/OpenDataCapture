import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

type SelectEditionProps = {
  onSelect: (id: string) => void;
  options: { [key: string]: string };
  value: null | string;
};

export const SelectEdition = ({ onSelect, options, value }: SelectEditionProps) => {
  const { t } = useTranslation();
  return (
    <Select
      disabled={Object.keys(options).length < 2}
      value={value && options[value] ? value : ''}
      onValueChange={(id) => {
        onSelect(id);
      }}
    >
      <Select.Trigger className="min-w-40" data-testid="select-edition-dropdown-trigger">
        <Select.Value placeholder={t('datahub.visualization.selectEdition')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {Object.entries(options).map(([id, label]) => (
            <Select.Item data-testid="select-edition-dropdown-item" key={id} value={id}>
              {label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
