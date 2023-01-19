import React from 'react';

import { Subject as SubjectInterface } from 'common';

import { Table } from '@/components/core';

export interface SubjectTableProps {
  data: SubjectInterface[];
}

export const SubjectsTable = ({ data }: SubjectTableProps) => (
  <Table
    columns={[
      {
        title: 'Subject',
        field: 'identifier'
      },
      {
        title: 'Date Registered',
        field: 'createdAt'
      },
      {
        title: 'Date of Birth',
        field: 'dateOfBirth'
      },
      {
        title: 'Sex',
        field: 'sex'
      }
    ]}
    data={data}
  />
);
