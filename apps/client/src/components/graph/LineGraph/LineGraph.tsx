import React from 'react';

import { CartesianGrid, ErrorBar, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface LineGraphProps {
  data: Array<{
    label: string;
    mean: number;
    std: number;
  }>;
}

export const LineGraph = ({ data }: LineGraphProps) => {
  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart data={data} margin={{ bottom: 20 }}>
        <Line dataKey="mean" stroke="#8884d8" type="monotone">
          <ErrorBar dataKey="std" direction="y" stroke="green" strokeWidth={2} width={4} />
        </Line>
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis
          dataKey="label"
          label={{ offset: -15, position: 'insideBottom', value: 'Timepoint' }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis label={{ angle: -90, value: 'Total Score' }} />
        <Tooltip />
        <Legend height={36} verticalAlign="top" />
      </LineChart>
    </ResponsiveContainer>
  );
};
