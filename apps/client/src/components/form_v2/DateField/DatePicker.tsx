import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { HiChevronDown } from 'react-icons/hi2';

export const DatePicker: React.FC = () => {
  const [value, setValue] = useState(new Date());
  const { t } = useTranslation();

  const [year, month] = useMemo(() => [value.getFullYear(), t('datetime.months')[value.getMonth()]], [value]);

  return (
    <div className="bg-slate-50 shadow-lg">
      <div className="flex">
        <span>{`${month} ${year}`}</span>
        <HiChevronDown />
      </div>
    </div>
  );
};
