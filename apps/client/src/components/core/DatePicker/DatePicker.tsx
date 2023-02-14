import React, { useReducer, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { ArrowToggle } from '../ArrowToggle';

import { Calendar } from './Calendar';

import { TransitionOpacity } from '@/components/transitions';

type DisplayItem = 'calendar' | 'year-selector';

interface ReducerAction {
  type: 'increment-month' | 'decrement-month';
}

const reducer = (previousDate: Date, action: ReducerAction) => {
  const newDate = new Date(previousDate.valueOf());
  switch (action.type) {
    case 'increment-month':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'decrement-month':
      newDate.setMonth(newDate.getMonth() - 1);
  }
  return newDate;
};

export interface DatePickerProps {
  onSelection: (value: Date) => void;
}

export const DatePicker = ({ onSelection }: DatePickerProps) => {
  const [date, dispatch] = useReducer(reducer, new Date());
  const [displayItem, setDisplayItem] = useState<DisplayItem>('calendar');
  const { t } = useTranslation();

  const monthName = t('datetime.months')[date.getMonth()];

  return (
    <div className="w-fit bg-slate-50 p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex">
          <span></span>
          <span className="ml-2 font-semibold">{`${monthName} ${date.getFullYear()}`}</span>
          <ArrowToggle
            className="mx-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="up"
            rotation={180}
          />
        </div>
        <div className="flex">
          <ArrowToggle
            className="mx-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="left"
            rotation={0}
            onClick={() => dispatch({ type: 'decrement-month' })}
          />
          <ArrowToggle
            className="ml-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200"
            position="right"
            rotation={0}
            onClick={() => dispatch({ type: 'increment-month' })}
          />
        </div>
      </div>
      <TransitionOpacity show={displayItem === 'calendar'}>
        <Calendar month={date.getMonth()} year={date.getFullYear()} onSelection={onSelection} />
      </TransitionOpacity>
    </div>
  );
};
