import React from 'react';

export interface TableColumn<T> {
  title: string;
  field: keyof T;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

export const Table = <T extends Record<string, string | number | Date>>({ data, columns }: TableProps<T>) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      key={column.title + index}
                      scope="col"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((entry, entryIndex) => (
                  <tr className="odd:bg-white even:bg-gray-100" key={entryIndex}>
                    {columns.map(({ field, title }, columnIndex) => {
                      return (
                        <td
                          className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                          key={title + columnIndex}
                        >
                          <span>{entry[field].toString()}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
