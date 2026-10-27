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
  CHART_SURFACE,
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
  // Typed as a pair rather than an array: `ReferenceLine`'s `segment` takes exactly two points.
  const trendSegment = ((): [{ x: number; y: number }, { x: number; y: number }] | null => {
    if (!trend || times.length === 0) return null;
    let tMin = times[0]!;
    let tMax = times[0]!;
    for (let i = 1; i < times.length; i++) {
      const t = times[i]!;
      if (t < tMin) tMin = t;
      if (t > tMax) tMax = t;
    }
    return [
      { x: tMin, y: trend.intercept + trend.slope * tMin },
      { x: tMax, y: trend.intercept + trend.slope * tMax }
    ];
  })();

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
          // A scatter's tooltip carries no label of its own, so the date is formatted in the row
          // recharts names after the x axis rather than through `labelFormatter`, which is never
          // called here. Both rows are named by their axis already.
          formatter={(value, name) => [
            name === xLabel && typeof value === 'number'
              ? new Intl.DateTimeFormat(resolvedLanguage, { dateStyle: 'medium' }).format(value)
              : value,
            name
          ]}
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
            stroke={CHART_SURFACE[resolvedTheme]}
            strokeWidth={2}
          />
        ))}
        {series.length > 1 && <Legend wrapperStyle={{ paddingLeft: 40, paddingTop: 10 }} />}
      </ScatterChart>
    </ResponsiveContainer>
  );
};
