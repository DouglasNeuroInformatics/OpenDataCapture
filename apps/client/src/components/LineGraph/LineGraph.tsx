import React from 'react';

import {
  CartesianGrid,
  ErrorBar,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
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
  legend = null
}: {
  /** An array of objects, where each object represents one point on the x-axis */
  data: T;
  lines: Array<{
    name: string;
    val: ExtractValidKeys<T, number>;
    err?: ExtractValidKeys<T, number>;
  }>;
  xAxis?: {
    key?: ExtractValidKeys<T, string>;
    label?: string;
  };
  legend: 'top' | 'right' | 'bottom' | null;
}) {
  let legendComponent: JSX.Element | null;
  switch (legend) {
    case 'bottom':
      legendComponent = <Legend wrapperStyle={{ paddingLeft: 40, paddingTop: 10 }} />;
      break;
    case 'top':
      legendComponent = <Legend height={36} verticalAlign="top" />;
      break;
    case 'right':
      legendComponent = (
        <Legend
          align="right"
          height={36}
          layout="vertical"
          verticalAlign="middle"
          wrapperStyle={{ paddingLeft: '1rem' }}
        />
      );
      break;
    default:
      legendComponent = null;
      break;
  }

  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={[...data]} margin={{ left: 10, right: 10, bottom: 5, top: 5 }}>
        <CartesianGrid stroke={'#ccc'} strokeDasharray="5 5" />
        <XAxis dataKey={xAxis?.key} height={50} padding={{ left: 20, right: 20 }} tickMargin={5} tickSize={8}>
          <Label offset={5} position="insideBottom" value={xAxis?.label} />
        </XAxis>
        <YAxis tickMargin={5} tickSize={8} width={40} />
        <Tooltip />
        {lines.map(({ name, val, err }) => (
          <Line dataKey={val} key={val} name={name} stroke={'black'} type="linear">
            {err && <ErrorBar dataKey={err} />}
          </Line>
        ))}
        {legendComponent}
      </LineChart>
    </ResponsiveContainer>
  );
}
