import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { TimeframeKey } from '@/utils/timeframe';

type TimeDropdownProps = {
  disabled?: boolean;
  /** Reports the chosen timeframe itself; the date it admits is derived with `timeframeMinDate` */
  onSelect: (key: TimeframeKey) => void;
  /** Drives the selection externally, for a view holding it in the URL */
  value?: TimeframeKey;
};

export const TimeDropdown = ({ disabled, onSelect, value }: TimeDropdownProps) => {
  const { t } = useTranslation('datahub');

  return (
    <Select
      {...(value === undefined ? { defaultValue: 'all' } : { value })}
      onValueChange={(selection) => onSelect(selection as TimeframeKey)}
    >
      <Select.Trigger className="min-w-32" data-testid="time-dropdown-trigger" disabled={disabled}>
        <Select.Value placeholder={t('visualization.timeframe')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Item data-testid="time-dropdown-item" value="all">
            {t('visualization.timeframeOptions.all')}
          </Select.Item>
          <Select.Item data-testid="time-dropdown-item" value="pastMonth">
            {t('visualization.timeframeOptions.month')}
          </Select.Item>
          <Select.Item data-testid="time-dropdown-item" value="pastYear">
            {t('visualization.timeframeOptions.year')}
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
