import React from 'react';

import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export type TimeDropdownProps = {
  disabled?: boolean;
  setMinTime: (value: Date | null) => void;
};

export const TimeDropdown = ({ disabled, setMinTime }: TimeDropdownProps) => {
  const { t } = useTranslation('datahub');

  return (
    <Select
      defaultValue="all"
      onValueChange={(selection) => {
        if (selection === 'pastYear') {
          setMinTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
        } else if (selection === 'pastMonth') {
          setMinTime(new Date(new Date().setMonth(new Date().getMonth() - 1)));
        } else {
          setMinTime(null);
        }
      }}
    >
      <Select.Trigger className="min-w-32" disabled={disabled}>
        <Select.Value placeholder={t('visualization.timeframe')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Item value="all">{t('visualization.timeframeOptions.all')}</Select.Item>
          <Select.Item value="pastMonth">{t('visualization.timeframeOptions.month')}</Select.Item>
          <Select.Item value="pastYear">{t('visualization.timeframeOptions.year')}</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
