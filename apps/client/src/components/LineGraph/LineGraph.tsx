import React from 'react';

import { CartesianGrid, ErrorBar, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type LineGraphDataEntry = Record<PropertyKey, any>;

export interface LineGraphProps<T extends LineGraphDataEntry> {
  data: T[];
  colors?: {
    grid?: string;
    lines?: Record<keyof T, string>;
  };
  xAxis: {
    key: keyof T & (string | number);
    label: string;
  };
  yAxis: {
    label: string;
  };
}

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
