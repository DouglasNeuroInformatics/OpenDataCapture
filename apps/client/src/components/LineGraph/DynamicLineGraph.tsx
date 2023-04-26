import React from 'react';

import { LineGraph } from './LineGraph';

export interface DynamicLineGraphProps {
  title: string;
}

export const DynamicLineGraph = ({ title }: DynamicLineGraphProps) => {
  return (
    <div className="grid max-w-3xl grid-cols-3 gap-5 border p-2">
      <div className="col-span-full">
        <h3 className="text-center text-2xl font-semibold">{title}</h3>
      </div>
      <div className="col-span-2">
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
      <div className="col-span-1">
        <h3 className="whitespace-nowrap text-center font-semibold">Data Selector</h3>
        <div>
          <h5>Instruments</h5>
        </div>
      </div>
    </div>
  );
};
