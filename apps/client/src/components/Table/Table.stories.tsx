import React from 'react';

import { Subject } from '@ddcp/types';
import { randomDate, randomInt, range } from '@douglasneuroinformatics/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Table, TableColumn } from './Table';

const columns: TableColumn<Subject>[] = [
  {
    name: 'ID',
    field: 'identifier'
  },
  {
    name: 'Date of Birth',
    field: (subject) => subject.dateOfBirth
  },
  {
    name: 'Sex',
    field: (subject) => subject.sex
  }
];

const data: Subject[] = range(25).map((i) => ({
  identifier: i.toString(),
  dateOfBirth: randomDate(new Date(1950, 0, 1), new Date()),
  sex: randomInt(0, 1) === 0 ? 'male' : 'female'
}));

export default {
  component: Table,
  args: {
    columns,
    data,
    entryLinkFactory: () => 'foo'
  }
} as ComponentMeta<typeof Table<Subject>>;

const Template: ComponentStory<typeof Table> = (args) => (
  <MemoryRouter>
    <Table {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});

Default.args = {};
