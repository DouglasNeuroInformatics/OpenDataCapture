import React, { useEffect, useRef } from 'react';

import { range } from '@douglasneuroinformatics/common';
import { clsx } from 'clsx';

export interface YearSelectorProps {
  selected: Date;
  onSelection: (date: Date) => void;
}

export const YearSelector = (props: YearSelectorProps) => {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from(range(currentYear - 100, currentYear + 8)).reverse();

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center' });
    }
  }, []);

  return (
    <div className="h-96 w-72 overflow-y-scroll">
      <div className="grid grid-cols-3">
        {years.map((year) => (
          <div className="flex h-12 items-center justify-center border" key={year}>
            <button
              className={clsx('rounded-full p-2 hover:bg-indigo-200', {
                'bg-indigo-800 text-white': year === props.selected.getFullYear()
              })}
              ref={year === props.selected.getFullYear() ? selectedRef : null}
              type="button"
              onClick={() => props.onSelection(new Date(year, 0))}
            >
              {year}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
