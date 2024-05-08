import React from 'react';

import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export type SelectInstrumentProps = {
  onSelect: (id: string) => void;
  options: { [key: string]: string };
};

export const SelectInstrument = ({ onSelect, options }: SelectInstrumentProps) => {
  const { t } = useTranslation(['datahub', 'core']);
  return (
    <Select
      onValueChange={(id) => {
        onSelect(id);
      }}
    >
      <Select.Trigger className="min-w-72">
        <Select.Value placeholder={t('visualization.selectInstrument')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {Object.entries(options).map(([id, label]) => (
            <Select.Item key={id} value={id}>
              {label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
