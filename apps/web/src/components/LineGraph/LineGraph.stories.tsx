import type { Meta, StoryObj } from '@storybook/react-vite';

import { LineGraph } from './LineGraph';

type GraphData = readonly {
  m1: number;
  m2: number;
  sd1: number;
  sd2: number;
  time: number;
}[];

type Story = StoryObj<typeof LineGraph<GraphData>>;

const meta: Meta<typeof LineGraph> = {
  component: LineGraph,
  decorators: [
    (Story) => (
      <div className="container flex justify-center">
        <div style={{ width: 600 }}>
          <Story />
        </div>
      </div>
    )
  ]
};

export default meta;

export const Default: Story = {
  args: {
    data: [
      {
        m1: 1000,
        m2: 550,
        sd1: 100,
        sd2: 100,
        time: new Date(2000, 0, 1).getTime()
      },
      {
        m1: 1500,
        m2: 600,
        sd1: 100,
        sd2: 100,
        time: new Date(2000, 1, 1).getTime()
      },
      {
        m1: 1200,
        m2: 500,
        sd1: 100,
        sd2: 100,
        time: new Date(2000, 2, 1).getTime()
      },
      {
        m1: 1800,
        m2: 450,
        sd1: 100,
        sd2: 100,
        time: new Date(2000, 3, 1).getTime()
      }
    ],
    lines: [
      {
        err: 'sd1',
        name: 'Mean 1',
        val: 'm1'
      },
      {
        err: 'sd2',
        name: 'Mean 2',
        val: 'm2'
      }
    ],
    xAxis: {
      key: 'time',
      label: 'Month'
    }
  }
};
