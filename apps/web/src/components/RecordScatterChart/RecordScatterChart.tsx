import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import {
  CartesianGrid,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

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

type RecordScatterChartProps = {
  measureLabel: string;
  series: RecordChartSeries[];
  /** The group-wide regression for the selected measure, drawn as a trend line when present */
  trend?: { intercept: number; slope: number };
  xLabel: string;
};

/**
 * One dot per record: collection date against the selected measure, across every subject.
 *
 * The marks carry a surface-coloured ring so overlapping records stay countable, which matters here
 * because a cohort assessed on the same day stacks vertically.
 */
export const RecordScatterChart = ({ measureLabel, series, trend, xLabel }: RecordScatterChartProps) => {
  const [theme] = useTheme();
  const { resolvedLanguage } = useTranslation();
  const resolvedTheme = resolveTheme(theme);

  const times = series.flatMap((item) => item.points.map((point) => point.time));
  const trendSegment =
    trend && times.length > 0
      ? [
          { x: Math.min(...times), y: trend.intercept + trend.slope * Math.min(...times) },
          { x: Math.max(...times), y: trend.intercept + trend.slope * Math.max(...times) }
        ]
      : null;

  return (
    <ResponsiveContainer height={400} width="100%">
      <ScatterChart margin={{ bottom: 5, left: 15, right: 15, top: 5 }}>
        <CartesianGrid stroke={AXIS_STROKE} strokeDasharray="5 5" />
        <XAxis
          axisLine={{ stroke: AXIS_STROKE }}
          dataKey="time"
          domain={['auto', 'auto']}
          height={X_AXIS_HEIGHT}
          name={xLabel}
          padding={{ left: 20, right: 20 }}
          stroke={inkColors[resolvedTheme]}
          tickFormatter={(time: number) => toBasicISOString(new Date(time))}
          tickLine={{ stroke: AXIS_STROKE }}
          tickMargin={8}
          tickSize={8}
          type="number"
        >
          <Label fill={inkColors[resolvedTheme]} offset={X_AXIS_LABEL_OFFSET} position="insideBottom" value={xLabel} />
        </XAxis>
        <YAxis
          axisLine={{ stroke: AXIS_STROKE }}
          dataKey="value"
          domain={['auto', 'auto']}
          name={measureLabel}
          stroke={inkColors[resolvedTheme]}
          tickLine={{ stroke: AXIS_STROKE }}
          tickMargin={5}
          tickSize={8}
          type="number"
          width={Y_AXIS_WIDTH}
        />
        <Tooltip
          contentStyle={tooltipStyles[resolvedTheme]}
          formatter={(value: number, name) => [value, name === 'time' ? xLabel : measureLabel]}
          labelFormatter={(time: number) =>
            new Intl.DateTimeFormat(resolvedLanguage, { dateStyle: 'medium' }).format(new Date(time))
          }
          labelStyle={{ color: inkColors[resolvedTheme], fontWeight: 500 }}
        />
        {trendSegment && (
          <ReferenceLine
            ifOverflow="extendDomain"
            segment={trendSegment}
            stroke={inkColors[resolvedTheme]}
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        )}
        {series.map((item) => (
          <Scatter
            data={item.points}
            fill={item.color}
            key={item.key}
            name={item.label}
            stroke={tooltipStyles[resolvedTheme].backgroundColor}
            strokeWidth={2}
          />
        ))}
        {series.length > 1 && <Legend wrapperStyle={{ paddingLeft: 40, paddingTop: 10 }} />}
      </ScatterChart>
    </ResponsiveContainer>
  );
};
