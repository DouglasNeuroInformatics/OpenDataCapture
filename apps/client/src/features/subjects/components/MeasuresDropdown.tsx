import React from 'react';

import { useTranslation } from 'react-i18next';

import { SelectedMeasure } from '../types';

import { SelectDropdown } from '@/components';

export type MeasuresDropdownProps = {
  options: SelectedMeasure[];
  selected: SelectedMeasure[];
  setSelected: React.Dispatch<React.SetStateAction<SelectedMeasure[]>>;
};

export const MeasuresDropdown = ({ options, selected, setSelected }: MeasuresDropdownProps) => {
  const { t } = useTranslation('subjects');
  return (
    <SelectDropdown
      checkPosition="right"
      className="text-sm"
      options={options}
      selected={selected}
      setSelected={setSelected}
      title={t('subjectPage.graph.measures')}
      variant="light"
    />
  );
};
