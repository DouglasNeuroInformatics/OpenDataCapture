import React from 'react';

import { LegendProps } from 'recharts';

import { LineGraph } from '@/components';

const CustomLegend = (props: LegendProps) => {
  const { payload } = props;

  return (
    <div className="h-full">
      <ul>
        {payload?.map((entry, index) => (
          <li key={`item-${index}`}>{entry.value}</li>
        ))}
      </ul>
    </div>
  );
};

export interface SubjectRecordsGraphProps {
  title: string;
}

export const SubjectRecordsGraph = ({ title }: SubjectRecordsGraphProps) => {
  return (
    <div className="max-w-3xl">
      <h3 className="text-center text-2xl font-semibold">Subject Records Graph</h3>
      <hr />
      <div>
        <LineGraph
          data={[
            {
              month: 'January',
              m1: 1000,
              sd1: 100,
              m2: 550,
              sd2: 100
            },
            {
              month: 'February',
              m1: 1500,
              sd1: 100,
              m2: 600,
              sd2: 100
            },
            {
              month: 'March',
              m1: 1200,
              sd1: 100,
              m2: 500,
              sd2: 100
            },
            {
              month: 'April',
              m1: 1800,
              sd1: 100,
              m2: 450,
              sd2: 100
            }
          ]}
          legend={{
            customElement: <CustomLegend />
          }}
          lines={[
            {
              name: 'Mean 1',
              val: 'm1',
              err: 'sd1'
            },
            {
              name: 'Mean 2',
              val: 'm2',
              err: 'sd2'
            }
          ]}
          xAxis={{
            key: 'month',
            label: 'Month'
          }}
          yAxis={{
            label: 'Average Daily Sales'
          }}
        />
      </div>
    </div>
  );
};
