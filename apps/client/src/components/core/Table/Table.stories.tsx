import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Random, SubjectInterface, range } from 'common';
import { MemoryRouter } from 'react-router-dom';

import { Table, TableColumn } from './Table';

const columns: TableColumn<SubjectInterface>[] = [
  {
    name: 'ID',
    field: 'identifier'
  },
  {
    name: 'Date of Birth',
    field: (subject) => subject.demographics.dateOfBirth
  },
  {
    name: 'Sex',
    field: (subject) => subject.demographics.sex
  },
  {
    name: 'Ethnicity',
    field: (subject) => subject.demographics.ethnicity
  }
];

const data: SubjectInterface[] = range(25).map((i) => ({
  identifier: i.toString(),
  demographics: {
    dateOfBirth: Random.birthday(),
    sex: Random.int(0, 1) === 0 ? 'male' : 'female'
  }
}));

export default {
  component: Table,
  args: {
    columns,
    data,
    entryLinkFactory: () => 'foo'
  }
} as ComponentMeta<typeof Table<SubjectInterface>>;

const Template: ComponentStory<typeof Table> = (args) => (
  <MemoryRouter>
    <Table {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});

Default.args = {};
