import React, { useMemo, useState } from 'react';

import { range } from 'common';
import { useTranslation } from 'react-i18next';

import { ArrowToggle } from '@/components/core';
import { TransitionOpacity } from '@/components/transitions';

interface Month {
  index: number;
  name: string;
  firstDay: number;
  lastDay: number;
  days: readonly number[];
}

export interface DatePickerProps {
  show?: boolean;
  onSelection: (value: Date) => void;
}

export const DatePicker = ({ show }: DatePickerProps) => {
  const [value, setValue] = useState(new Date());
  const { t } = useTranslation();

  const handleSelection = (day: number) => {
    return; //alert(day);
  };

  const [year, month] = useMemo(() => {
    const year = value.getFullYear();
    const month: Partial<Month> = {
      index: value.getMonth(),
      firstDay: new Date(year, value.getMonth()).getDay(),
      lastDay: new Date(year, value.getMonth() + 1, 0).getDate()
    };
    month.days = range(1, month.lastDay! + 1);
    month.name = t('datetime.months')[month.index!];
    return [year, month as Month];
  }, [value]);

  const labels = t('datetime.days').map((day) => day.charAt(0).toUpperCase());

  return (
    <TransitionOpacity show={show}>
      <div className="w-fit bg-slate-50 p-3 shadow-lg">
        <div className="mb-3 flex items-center">
          <span className="ml-2 font-semibold">{`${month.name} ${year}`}</span>
          <ArrowToggle
            className="mx-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="right"
            rotation={-90}
          />
        </div>
        <div className="grid w-72 grid-cols-7 gap-4">
          {labels.map((label, i) => (
            <div className="flex items-center justify-center" key={i}>
              {label}
            </div>
          ))}
          <div style={{ gridColumn: `span ${month.firstDay} / span ${month.firstDay}` }} />
          {month.days.map((day) => (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm hover:bg-slate-200"
              key={day}
              onClick={() => handleSelection(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </TransitionOpacity>
  );
};
