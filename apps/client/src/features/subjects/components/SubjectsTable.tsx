import React from 'react';

import { Subject } from '@ddcp/common';

import { Dropdown, Table } from '@/components';
import { useDownload } from '@/hooks/useDownload';

export interface SubjectTableProps {
  data: Subject[];
}

export const SubjectsTable = ({ data }: SubjectTableProps) => {
  const downloadJSON = useDownload('/api/v0/instruments/records/export-json', 'records.json');
  const downloadCSV = useDownload('/api/v0/instruments/records/export-csv', 'records.csv');

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
      <Table<Subject>
        columns={[
          {
            name: 'Subject',
            field: (subject) => subject.identifier.slice(0, 6)
          },
          {
            name: 'Date of Birth',
            field: (subject) => subject.dateOfBirth
          },
          {
            name: 'Sex',
            field: (subject) => subject.sex
          }
        ]}
        data={data}
        entryLinkFactory={(subject) => subject.identifier}
      />
    </div>
  );
};
