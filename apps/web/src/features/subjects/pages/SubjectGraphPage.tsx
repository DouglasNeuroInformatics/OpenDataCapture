import { useState } from 'react';

import { Button, Dropdown, LineGraph, SelectDropdown, type SelectOption } from '@douglasneuroinformatics/ui/legacy';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

import { TimeDropdown } from '../components/TimeDropdown';
import { VisualizationHeader } from '../components/VisualizationHeader';
import { useGraphData } from '../hooks/useGraphData';
import { useGraphLines } from '../hooks/useGraphLines';
import { useInstrumentVisualization } from '../hooks/useInstrumentVisualization';
import { useLinearModelQuery } from '../hooks/useLinearModelQuery';
import { useMeasureOptions } from '../hooks/useMeasureOptions';

export const SubjectGraphPage = () => {
  const { currentGroup } = useAuthStore();
  const params = useParams();
  const { instrument, instrumentId, instrumentOptions, minDate, records, setInstrumentId, setMinDate } =
    useInstrumentVisualization({
      params: { subjectId: params.subjectId! }
    });
  const { t } = useTranslation(['subjects', 'common', 'core']);
  const measureOptions = useMeasureOptions(instrument);
  const [selectedMeasures, setSelectedMeasures] = useState<SelectOption[]>([]);

  const linearModelQuery = useLinearModelQuery({
    enabled: Boolean(instrumentId),
    params: {
      groupId: currentGroup?.id,
      instrumentId: instrumentId!
    }
  });
  const graphData = useGraphData({
    models: linearModelQuery.data,
    records,
    selectedMeasures
  });

  const lines = useGraphLines({ selectedMeasures });

  const handleSelectForm = (id: string) => {
    setInstrumentId(id);
    setSelectedMeasures([]);
  };

  const handlePrint = () => {
    window.resizeBy(window.screen.width / 2, window.screen.height / 2);
    print();
  };

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader minDate={minDate} title={instrument?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between print:hidden">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="instrument-select">
              <Dropdown
                className="text-sm"
                options={instrumentOptions}
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
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="time-select">
              <TimeDropdown setMinTime={setMinDate} />
            </div>
            <div className="relative w-full whitespace-nowrap" data-cy="download-button">
              <Button
                className="relative w-full whitespace-nowrap text-sm"
                label="Download"
                variant="secondary"
                onClick={() => handlePrint()}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="print:h-[400px] print:w-[400px]">
        <LineGraph
          data={graphData}
          lines={lines}
          xAxis={{
            key: '__time__',
            label: t('visualization.xLabel')
          }}
        />
      </div>
    </div>
  );
};
