import { useEffect, useState } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import {
  Dropdown,
  LineGraph,
  type LineGraphLine,
  SelectDropdown,
  type SelectOption
} from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrumentSummary } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAvailableForms } from '@/hooks/useAvailableForms';
import { useFormRecords } from '@/hooks/useFormRecords';
import { useAuthStore } from '@/stores/auth-store';

import { TimeDropdown } from '../components/TimeDropdown';
import { VisualizationHeader } from '../components/VisualizationHeader';

type GraphData = {
  [key: string]: unknown;
  date: Date;
}[];

const COLOR_PALETTE = [
  '#D81B60',
  '#1E88E5',
  '#FD08FA',
  '#A06771',
  '#353A9B',
  '#D90323',
  '#9C9218',
  '#CF0583',
  '#4075A3'
];

export const SubjectGraphPage = () => {
  const { currentGroup } = useAuthStore();
  const params = useParams();
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [graphData, setGraphData] = useState<GraphData>([]);
  const [selectedForm, setSelectedForm] = useState<FormInstrumentSummary<FormDataType, Language> | null>(null);
  const [measureOptions, setMeasureOptions] = useState<SelectOption[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<SelectOption[]>([]);
  const { t } = useTranslation(['subjects', 'common']);

  useEffect(() => {
    const arr: SelectOption[] = [];
    if (selectedForm) {
      for (const measure in selectedForm.measures) {
        arr.push({
          key: measure,
          label: selectedForm.measures[measure]!.label
        });
      }
    }
    return setMeasureOptions(arr);
  }, [selectedForm]);

  const formsQuery = useAvailableForms();
  const recordsQuery = useFormRecords({
    enabled: selectedForm !== null,
    params: {
      groupId: currentGroup?.id,
      instrumentId: selectedForm?.id,
      subjectIdentifier: params.subjectIdentifier!
    }
  });

  useEffect(() => {
    if (recordsQuery.data) {
      const data: GraphData = [];
      for (const record of recordsQuery.data) {
        data.push({
          date: record.date,
          ...record.computedMeasures,
          ...record.data
        });
      }
      setGraphData(data);
    }
  }, [recordsQuery.data]);

  if (!formsQuery.data) {
    return null;
  }

  const formOptions: Record<string, string> = {};
  for (const form of formsQuery.data) {
    formOptions[form.id!] = form.details.title;
  }

  const lines: LineGraphLine[] = [];
  for (let i = 0; i < selectedMeasures.length; i++) {
    const measure = selectedMeasures[i]!;
    lines.push({
      name: measure.label,
      stroke: COLOR_PALETTE[i],
      val: measure.key
    });
    lines.push({
      legendType: 'none',
      name: `${measure.label} (${t('common:groupTrend')})`,
      stroke: COLOR_PALETTE[i],
      strokeDasharray: '5 5',
      strokeWidth: 0.5,
      val: measure.key + 'Group'
    });
  }

  const handleSelectForm = (id: string) => {
    setSelectedForm(formsQuery.data.find((form) => form.id === id) ?? null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="py-2">
        <VisualizationHeader minDate={minDate} title={selectedForm?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="instrument-select">
              <Dropdown
                className="text-sm"
                options={formOptions}
                title={t('visualization.instrument')}
                variant="secondary"
                onSelection={handleSelectForm}
              />
            </div>
            <div data-cy="measure-select">
              <SelectDropdown
                checkPosition="right"
                className="text-sm"
                options={measureOptions}
                selected={selectedMeasures}
                setSelected={setSelectedMeasures}
                title={t('visualization.measures')}
                variant="secondary"
              />
            </div>
          </div>
          <div data-cy="time-select">
            <TimeDropdown setMinTime={setMinDate} />
          </div>
        </div>
      </div>
      <div>
        <LineGraph
          data={graphData}
          lines={lines}
          xAxis={{
            key: 'date',
            label: t('visualization.xLabel')
          }}
        />
      </div>
    </div>
  );
};
