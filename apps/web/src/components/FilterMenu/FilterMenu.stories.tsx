import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { FilterMenu } from './FilterMenu';

type Story = StoryObj<typeof FilterMenu>;

const options = [
  { label: 'Depression Clinic', value: 'depression-clinic' },
  { label: 'Psychosis Lab', value: 'psychosis-lab' }
];

const Controlled = ({ initialValue }: { initialValue?: string }) => {
  const [value, setValue] = useState<string | undefined>(initialValue);
  return <FilterMenu allLabel="All groups" label="Group" options={options} value={value} onValueChange={setValue} />;
};

export default { component: FilterMenu } as Meta<typeof FilterMenu>;

export const Empty: Story = {
  render: () => <Controlled />
};

export const Selected: Story = {
  render: () => <Controlled initialValue="psychosis-lab" />
};
