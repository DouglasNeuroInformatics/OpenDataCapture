import React, { useState } from 'react';

import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

import { Button, Link } from '@/components/base';

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'number') {
    return value.toFixed(2).toString();
  } else if (typeof value === 'undefined') {
    return 'NA';
  }

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  return JSON.stringify(value);
}

export interface TableColumn<T> {
  name: string;
  field: keyof T | ((entry: T) => unknown);
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  entryLinkFactory?: (entry: T) => string;
}

export const Table = <T extends Record<string, unknown>>({ columns, data, entryLinkFactory }: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);
  const pageCount = Math.ceil(data.length / entriesPerPage);
  const pageNumbers = [...Array(pageCount).keys()].map((i) => i + 1);

  return (
    <div>
      <div className="flex justify-end">
        <Button disabled className="mx-2 my-1" label="Filters" />
        <Button disabled className="my-1" label="Export" />
      </div>
      <table className="block w-full table-auto overflow-x-scroll border-2">
        <thead>
          {columns.map((column, i) => (
            <th className="whitespace-nowrap p-2" key={i}>
              {column.name}
            </th>
          ))}
        </thead>
        <tbody>
          {currentEntries.map((entry, i) => (
            <tr key={i}>
              {columns.map(({ field }, j) => {
                const value = typeof field === 'function' ? field(entry) : entry[field];
                return (
                  <td className="whitespace-nowrap p-2" key={j}>
                    <span>{formatValue(value)}</span>
                  </td>
                );
              })}
              {entryLinkFactory && (
                <td className="whitespace-nowrap p-2">
                  <Link to={entryLinkFactory(entry)}>View</Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex justify-center">
        <button>
          <HiArrowLeft />
        </button>
        {pageNumbers.map((page) => (
          <button className="mx-1" key={page} onClick={() => setCurrentPage(page)}>
            {page}
          </button>
        ))}
        <button>
          <HiArrowRight />
        </button>
      </div>
    </div>
  );
};
