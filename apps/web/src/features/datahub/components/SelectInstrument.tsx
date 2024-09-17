import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

export type SelectInstrumentProps = {
  onSelect: (id: string) => void;
  options: { [key: string]: string };
};

export const SelectInstrument = ({ onSelect, options }: SelectInstrumentProps) => {
  const { t } = useTranslation();
  return (
    <Select
      onValueChange={(id) => {
        onSelect(id);
      }}
    >
      <Select.Trigger className="min-w-72" data-cy="select-instrument-dropdown-trigger">
        <Select.Value placeholder={t('datahub.visualization.selectInstrument')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {Object.entries(options).map(([id, label]) => (
            <Select.Item data-cy="select-instrument-dropdown-item" key={id} value={id}>
              {label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
