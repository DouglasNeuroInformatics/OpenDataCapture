import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { ArrowToggle } from '@/components/core';
import { TransitionOpacity } from '@/components/transitions';

export interface DatePickerProps {
  show?: boolean;
}

export const DatePicker = ({ show }: DatePickerProps) => {
  const [value, setValue] = useState(new Date());
  const { t } = useTranslation();

  const [year, month] = useMemo(() => [value.getFullYear(), t('datetime.months')[value.getMonth()]], [value]);

  return (
    <TransitionOpacity show={show}>
      <div className="bg-slate-50 shadow-lg">
        <div className="flex items-center">
          <span className="font-semibold">{`${month} ${year}`}</span>
          <ArrowToggle className="mx-1" position="right" rotation={-90} />
        </div>
      </div>
    </TransitionOpacity>
  );
};
