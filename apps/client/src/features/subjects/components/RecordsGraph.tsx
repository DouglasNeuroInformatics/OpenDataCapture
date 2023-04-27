import React from 'react';

import { ArrowToggle, Dropdown, LineGraph } from '@/components';

const DropdownToggle = ({ text }: { text: string }) => (
  <ArrowToggle className="border px-3 py-1" content={text} contentPosition="left" position="up" rotation={180} />
);

export const RecordsGraph = () => {
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <div className="ml-[70px] flex justify-between p-2">
          <div className="flex gap-2">
            <Dropdown
              options={{
                a: 'A',
                b: 'B'
              }}
              title="Instrument"
              variant="light"
              onSelection={(option) => alert(option)}
            />
            <DropdownToggle text="Instrument" />
            <DropdownToggle text="Measures" />
          </div>
          <DropdownToggle text="Timeframe" />
        </div>
        <LineGraph
          data={[
            {
              x: '1',
              y: 1
            },
            {
              x: '2',
              y: 2
            },
            {
              x: ' 3',
              y: 3
            }
          ]}
          legend={null}
          lines={[
            {
              name: 'Value',
              val: 'y'
            }
          ]}
          xAxis={{
            key: 'x',
            label: 'X'
          }}
          yAxis={{
            label: 'Y'
          }}
        />
      </div>
    </div>
  );
};
