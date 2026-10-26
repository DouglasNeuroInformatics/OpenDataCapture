import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

type TimeDropdownSelection = 'all' | 'pastMonth' | 'pastYear';

type TimeDropdownProps = {
  disabled?: boolean;
  setMinTime: (value: Date | null, key?: TimeDropdownSelection) => void;
  value?: TimeDropdownSelection;
};

export const TimeDropdown = ({ disabled, setMinTime, value }: TimeDropdownProps) => {
  const { t } = useTranslation('datahub');

  const handleChange = (selection: string) => {
    const key = selection as TimeDropdownSelection;
    if (key === 'pastYear') {
      setMinTime(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), key);
    } else if (key === 'pastMonth') {
      setMinTime(new Date(new Date().setMonth(new Date().getMonth() - 1)), key);
    } else {
      setMinTime(null, key);
    }
  };

  const controlled = value !== undefined;

  return (
    <Select {...(controlled ? { value } : { defaultValue: 'all' })} onValueChange={handleChange}>
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

export type { TimeDropdownSelection };
