import React from 'react';

import { range } from 'common';
import { useTranslation } from 'react-i18next';

export interface MonthProps {
  date: Date;
}

export const Month = ({ date }: MonthProps) => {
  const { t } = useTranslation();

  const firstDay = new Date(date.getFullYear(), date.getMonth()).getDay();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const days = range(1, lastDay + 1);
  const labels = t('datetime.days').map((day) => day.charAt(0).toUpperCase());

  return (
    <div className="grid w-72 grid-cols-7 gap-4">
      {labels.map((label) => (
        <div className="flex items-center justify-center" key={label}>
          {label}
        </div>
      ))}
      <div className={`col-span-${firstDay} border`} />
      {days.map((day) => (
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm hover:bg-slate-200" key={day}>
          {day}
        </div>
      ))}
    </div>
  );
};
