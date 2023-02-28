import React from 'react';

import { CartesianGrid, ErrorBar, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface LineGraphProps {
  data: Array<{
    label: string;
    mean: number;
    std: number;
  }>;
  xAxis?: {
    label?: string;
  };
  yAxis?: {
    label?: string;
  };
}

export const LineGraph = ({ data, xAxis = { label: 'X' }, yAxis = { label: 'Y' } }: LineGraphProps) => {
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={data} margin={{ bottom: 20 }}>
        <Line dataKey="mean" label="Foo" stroke="#312E81" type="monotone">
          <ErrorBar dataKey="std" direction="y" stroke="#6366F1" strokeWidth={2} width={4} />
        </Line>
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis
          dataKey="label"
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
