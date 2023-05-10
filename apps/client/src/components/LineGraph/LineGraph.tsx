import React from 'react';

import { DateUtils } from '@douglasneuroinformatics/common';
import {
  CartesianGrid,
  ErrorBar,
  Label,
  Legend,
  Line,
  LineChart,
  LineProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ConditionalKeys } from 'type-fest';

import i18n from '@/services/18n';

/** An array of arbitrary objects with data to graph  */
type LineGraphData = readonly Record<string, any>[];

/** Extract string keys from items in `T` where the value of `T[K]` extends `K` */
type ExtractValidKeys<T extends LineGraphData, K> = Extract<ConditionalKeys<T[number], K>, string>;

type LineGraphLine<T extends LineGraphData = Record<string, any>[]> = Pick<
  LineProps,
  'stroke' | 'strokeWidth' | 'type' | 'legendType' | 'strokeDasharray'
> & {
  name: string;
  val: ExtractValidKeys<T, number>;
  err?: ExtractValidKeys<T, number>;
};

// eslint-disable-next-line react/function-component-definition
function LineGraphComponent<const T extends LineGraphData>({
  data,
  lines,
  xAxis
}: {
  /** An array of objects, where each object represents one point on the x-axis */
  data: T;
  lines: LineGraphLine<T>[];
  xAxis?: {
    key?: ExtractValidKeys<T, number>; // unix time
    label?: string;
  };
}) {
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={[...data]} margin={{ left: 10, right: 10, bottom: 5, top: 5 }}>
        <CartesianGrid stroke={'#ccc'} strokeDasharray="5 5" />
        <XAxis
          dataKey={xAxis?.key}
          domain={['auto', 'auto']}
          height={50}
          interval="preserveStartEnd"
          padding={{ left: 20, right: 20 }}
          tickFormatter={(time: number) => DateUtils.toBasicISOString(new Date(time))}
          tickMargin={5}
          tickSize={8}
          type={'number'}
        >
          <Label offset={5} position="insideBottom" value={xAxis?.label} />
        </XAxis>
        <YAxis tickMargin={5} tickSize={8} width={40} />
        <Tooltip
          labelFormatter={(time: number) => {
            const date = new Date(time);
            return new Intl.DateTimeFormat(i18n.resolvedLanguage, {
              dateStyle: 'full',
              timeStyle: 'medium'
            }).format(date);
          }}
          labelStyle={{ whiteSpace: 'pre-wrap' }}
        />
        {lines.map(({ name, val, err, stroke, type, ...props }) => (
          <Line dataKey={val} key={val} name={name} stroke={stroke ?? 'black'} type={type ?? 'linear'} {...props}>
            {err && <ErrorBar dataKey={err} />}
          </Line>
        ))}
        <Legend wrapperStyle={{ paddingLeft: 40, paddingTop: 10 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const LineGraph = React.memo(LineGraphComponent) as unknown as typeof LineGraphComponent;

export { type LineGraphLine };
