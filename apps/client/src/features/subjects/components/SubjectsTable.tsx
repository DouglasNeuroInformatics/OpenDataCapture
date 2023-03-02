import React from 'react';

import { SubjectInterface } from 'common';

import { Dropdown, Table } from '@/components/core';
import { useDownload } from '@/hooks/useDownload';

export interface SubjectTableProps {
  data: SubjectInterface[];
}

export const SubjectsTable = ({ data }: SubjectTableProps) => {
  const downloadJSON = useDownload('/api/instruments/records/export-json', 'records.json');
  const downloadCSV = useDownload('/api/instruments/records/export-csv', 'records.csv');

  const handleExportSelection = (option: string | ('JSON' | 'CSV')) => {
    switch (option) {
      case 'JSON':
        downloadJSON();
        break;
      case 'CSV':
        downloadCSV();
        break;
    }
  };

  return (
    <div>
      <div className="my-2 flex justify-between gap-5">
        <input
          required
          className="block w-full rounded-lg border border-gray-300 px-4 py-3 pl-2 text-sm"
          placeholder="Search..."
          type="search"
        />
        <div className="flex gap-2">
          <Dropdown options={[]} title="Filters" onSelection={() => null} />
          <Dropdown options={['CSV', 'JSON']} title="Export" onSelection={handleExportSelection} />
        </div>
      </div>
      <Table
        columns={[
          {
            name: 'Subject',
            field: (subject) => subject.identifier.slice(0, 6)
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
            name: 'Forward Sortation Area',
            field: (subject) => subject.demographics.forwardSortationArea
          },
          {
            name: 'Ethnicity',
            field: (subject) => subject.demographics.ethnicity
          },
          {
            name: 'Gender',
            field: (subject) => subject.demographics.gender
          },
          {
            name: 'Employment Status',
            field: (subject) => subject.demographics.employmentStatus
          },
          {
            name: 'Marital Status',
            field: (subject) => subject.demographics.maritalStatus
          },
          {
            name: 'First Language',
            field: (subject) => subject.demographics.firstLanguage
          }
        ]}
        data={data}
        entryLinkFactory={(subject) => subject.identifier}
      />
    </div>
  );
};
