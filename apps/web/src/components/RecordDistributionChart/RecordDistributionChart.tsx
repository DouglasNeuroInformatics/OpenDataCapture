import { useMemo } from 'react';

import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import { Bar, BarChart, CartesianGrid, Label, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { RecordChartSeries } from '@/hooks/useRecordChartSeries';
import {
  AXIS_STROKE,
  inkColors,
  resolveTheme,
  tooltipStyles,
  X_AXIS_HEIGHT,
  X_AXIS_LABEL_OFFSET,
  Y_AXIS_WIDTH
} from '@/utils/chart-theme';
import { binDistribution } from '@/utils/distribution';

type RecordDistributionChartProps = {
  countLabel: string;
  /** False when the measure's values are categories, which are counted as-is rather than binned */
  isNumeric: boolean;
  measureLabel: string;
  series: RecordChartSeries[];
};

/**
 * How the selected measure is distributed across subjects, as counts per bin.
 *
 * A numeric measure is binned over the range spanned by every series at once, so bars from
 * different groups line up and can be compared; a categorical measure is counted per distinct
 * value instead, since binning a category is meaningless.
 */
export const RecordDistributionChart = ({
  countLabel,
  isNumeric,
  measureLabel,
  series
}: RecordDistributionChartProps) => {
  const [theme] = useTheme();
  const resolvedTheme = resolveTheme(theme);

  const data = useMemo(() => binDistribution(series, isNumeric), [isNumeric, series]);

  return (
    <ResponsiveContainer height={400} width="100%">
      <BarChart barGap={2} data={data} margin={{ bottom: 5, left: 15, right: 15, top: 5 }}>
        <CartesianGrid stroke={AXIS_STROKE} strokeDasharray="5 5" vertical={false} />
        <XAxis
          axisLine={{ stroke: AXIS_STROKE }}
          dataKey="bin"
          height={X_AXIS_HEIGHT}
          stroke={inkColors[resolvedTheme]}
          tickLine={{ stroke: AXIS_STROKE }}
          tickMargin={8}
          tickSize={8}
        >
          <Label
            fill={inkColors[resolvedTheme]}
            offset={X_AXIS_LABEL_OFFSET}
            position="insideBottom"
            value={measureLabel}
          />
        </XAxis>
        <YAxis
          allowDecimals={false}
          axisLine={{ stroke: AXIS_STROKE }}
          stroke={inkColors[resolvedTheme]}
          tickLine={{ stroke: AXIS_STROKE }}
          tickMargin={5}
          tickSize={8}
          width={Y_AXIS_WIDTH}
        >
          <Label angle={-90} fill={inkColors[resolvedTheme]} position="insideLeft" value={countLabel} />
        </YAxis>
        <Tooltip
          contentStyle={tooltipStyles[resolvedTheme]}
          labelStyle={{ color: inkColors[resolvedTheme], fontWeight: 500 }}
        />
        {series.map((item) => (
          <Bar dataKey={item.key} fill={item.color} key={item.key} name={item.label} radius={[4, 4, 0, 0]} />
        ))}
        {series.length > 1 && <Legend wrapperStyle={{ paddingLeft: 40, paddingTop: 10 }} />}
      </BarChart>
    </ResponsiveContainer>
  );
};
