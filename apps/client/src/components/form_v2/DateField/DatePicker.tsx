import React, { useMemo, useState } from 'react';

import { Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

import { ArrowToggle } from '@/components/core';

export interface DatePickerProps {
  show?: boolean;
}

export const DatePicker = ({ show }: DatePickerProps) => {
  const [value, setValue] = useState(new Date());
  const { t } = useTranslation();

  const [year, month] = useMemo(() => [value.getFullYear(), t('datetime.months')[value.getMonth()]], [value]);

  return (
    <Transition
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={show}
    >
      <div className="bg-slate-50 shadow-lg">
        <div className="flex items-center">
          <span className="font-semibold">{`${month} ${year}`}</span>
          <ArrowToggle className="mx-1" position="right" rotation={-90} />
        </div>
      </div>
    </Transition>
  );
};
