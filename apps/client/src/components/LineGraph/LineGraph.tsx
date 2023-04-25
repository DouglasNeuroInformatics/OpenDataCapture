import React from 'react';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ConditionalKeys } from 'type-fest';

/** An array of arbitrary objects with data to graph  */
type LineGraphData = readonly object[];

/** Extract string keys from items in `T` where the value of `T[K]` extends `K` */
type ExtractValidKeys<T extends LineGraphData, K> = Extract<ConditionalKeys<T[number], K>, string>;

// eslint-disable-next-line react/function-component-definition
export function LineGraph<const T extends LineGraphData>({
  data,
  lines,
  xAxis,
  yAxis
}: {
  /** An array of objects, where each object represents one point on the x-axis */
  data: T;
  lines: Array<{
    name: string;
    val: ExtractValidKeys<T, number>;
    err: ExtractValidKeys<T, number>;
  }>;
  xAxis?: {
    key?: ExtractValidKeys<T, string>;
    label?: string;
  };
  yAxis: {
    label?: string;
  };
}) {
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={[...data]} margin={{ bottom: 20 }}>
        <CartesianGrid stroke={'#ccc'} strokeDasharray="5 5" />
        <XAxis
          dataKey={xAxis?.key}
          label={{ offset: -15, position: 'insideBottom', value: xAxis?.label }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis label={{ angle: -90, value: yAxis.label }} />
        <Tooltip />
        <Legend height={36} verticalAlign="top" />
        {lines.map(({ name, val }) => (
          <Line dataKey={val} key={val} name={name} stroke={'black'} type="monotone"></Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/*



export const LineGraph = <T extends LineGraphDataEntry = LineGraphDataEntry>({
  data,
  colors,
  xAxis,
  yAxis
}: LineGraphProps<T>) => {
  const yAxisKeys = Object.keys(data[0]).filter((item) => item !== xAxis.key);
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={data} margin={{ bottom: 20 }}>
        {yAxisKeys.map((key) => (
          <Line dataKey={key} key={key} label={key} stroke={colors?.lines?.[key] ?? 'black'} type="monotone"></Line>
        ))}
        <CartesianGrid stroke={colors?.grid ?? '#ccc'} strokeDasharray="5 5" />
        <XAxis
          dataKey={xAxis.key}
          label={{ offset: -15, position: 'insideBottom', value: xAxis.label }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis label={{ angle: -90, value: yAxis.label }} />
        <Tooltip />
        <Legend height={36} verticalAlign="top" />
      </LineChart>
    </ResponsiveContainer>
  );
};
*/
