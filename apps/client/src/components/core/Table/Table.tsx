import React, { useState } from 'react';

import clsx from 'clsx';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
      <div className="overflow-x-scroll">
        <table className="relative w-full table-auto border">
          <thead>
            {columns.map((column, i) => (
              <th className="whitespace-nowrap px-6 py-4 text-left" key={i}>
                {column.name}
              </th>
            ))}
          </thead>
          <tbody>
            {currentEntries.map((entry, i) => (
              <tr
                className="odd:bg-slate-100 hover:bg-zinc-200"
                key={i}
                onClick={() => {
                  if (!entryLinkFactory) {
                    return;
                  }
                  navigate(entryLinkFactory(entry));
                }}
              >
                {columns.map(({ field }, j) => {
                  const value = typeof field === 'function' ? field(entry) : entry[field];
                  return (
                    <td className="whitespace-nowrap px-6 py-4" key={j}>
                      <span>{formatValue(value)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="my-3 flex justify-center">
        <button className="flex h-8 w-8 items-center justify-center rounded-full border">
          <HiArrowLeft />
        </button>
        {pageNumbers.map((page) => (
          <button
            className={clsx('mx-1 flex h-8 w-8 items-center justify-center rounded-full border', {
              'bg-slate-600 text-slate-100': currentPage === page,
              'hover:bg-slate-200': currentPage !== page
            })}
            key={page}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button className="flex h-8 w-8 items-center justify-center rounded-full border">
          <HiArrowRight />
        </button>
      </div>
    </div>
  );
};
