import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $SummaryTrendWindow } from '@opendatacapture/schemas/summary';
import type { SummaryTrendWindow } from '@opendatacapture/schemas/summary';

type TrendWindowSelectProps = {
  'data-testid'?: string;
  onChange: (window: SummaryTrendWindow) => void;
  value: SummaryTrendWindow;
};

/** Picks how far back a dashboard trend chart reaches. */
export const TrendWindowSelect = ({ 'data-testid': testId, onChange, value }: TrendWindowSelectProps) => {
  const { t } = useTranslation();
  const labels: { [K in SummaryTrendWindow]: string } = {
    all: t({ en: 'All Time', es: 'Todo el tiempo', fr: 'Depuis le début' }),
    default: t({ en: 'Default', es: 'Predeterminado', fr: 'Par défaut' }),
    past2Years: t({ en: 'Last 2 Years', es: 'Últimos 2 años', fr: '2 dernières années' }),
    past3Months: t({ en: 'Last 3 Months', es: 'Últimos 3 meses', fr: '3 derniers mois' }),
    past5Years: t({ en: 'Last 5 Years', es: 'Últimos 5 años', fr: '5 dernières années' }),
    past6Months: t({ en: 'Last 6 Months', es: 'Últimos 6 meses', fr: '6 derniers mois' }),
    pastMonth: t({ en: 'Last Month', es: 'Último mes', fr: 'Dernier mois' }),
    pastYear: t({ en: 'Last Year', es: 'Último año', fr: 'Dernière année' })
  };
  return (
    <Select value={value} onValueChange={(selection) => onChange($SummaryTrendWindow.parse(selection))}>
      <Select.Trigger
        aria-label={t({ en: 'Time Window', es: 'Periodo de tiempo', fr: 'Période' })}
        className="w-40"
        data-testid={testId}
      >
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {$SummaryTrendWindow.options.map((option) => (
          <Select.Item key={option} value={option}>
            {labels[option]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
