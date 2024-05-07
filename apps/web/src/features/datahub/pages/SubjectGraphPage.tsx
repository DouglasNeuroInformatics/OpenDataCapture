import React, { useRef, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  Button,
  Card,
  LineGraph,
  ListboxDropdown,
  type ListboxDropdownOption
} from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAppStore } from '@/store';

import { TimeDropdown } from '../components/TimeDropdown';
import { VisualizationHeader } from '../components/VisualizationHeader';
import { useGraphData } from '../hooks/useGraphData';
import { useGraphLines } from '../hooks/useGraphLines';
import { useInstrumentVisualization } from '../hooks/useInstrumentVisualization';
import { useLinearModelQuery } from '../hooks/useLinearModelQuery';
import { useMeasureOptions } from '../hooks/useMeasureOptions';

export const SubjectGraphPage = () => {
  const downloadCanvas = useDownload();
  const currentGroup = useAppStore((store) => store.currentGroup);
  const params = useParams();
  const { instrument, instrumentId, instrumentOptions, minDate, records, setInstrumentId, setMinDate } =
    useInstrumentVisualization({
      params: { subjectId: params.subjectId! }
    });
  const { t } = useTranslation(['datahub', 'common', 'core']);
  const measureOptions = useMeasureOptions(instrument);
  const [selectedMeasures, setSelectedMeasures] = useState<ListboxDropdownOption[]>([]);

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

  const graphContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectForm = (id: string) => {
    setInstrumentId(id);
    setSelectedMeasures([]);
  };

  const handleGraphDownload = async () => {
    if (!graphContainerRef.current) return;

    const canvas = await html2canvas(graphContainerRef.current, {
      onclone: (_, element) => {
        const graphDesc = document.createElement('p');

        const formType = instrument!.details.title;
        const subjectId = params.subjectId!.slice(0, 7);

        graphDesc.innerText = t('downloadInfo.subjectText', {
          form: formType ?? '',
          id: subjectId ?? ''
        });

        graphDesc.className = 'p-2 font-semibold text-center';
        element.prepend(graphDesc);

        if (selectedMeasures) {
          const graphMeasure = document.createElement('p');
          graphMeasure.innerText = t('downloadInfo.measurement');
          for (const selectMeasureOption of selectedMeasures) {
            graphMeasure.innerText += selectMeasureOption.label + ' ';
          }
          graphMeasure.className = 'p-2 font-semibold';
          element.append(graphMeasure);
        }

        const graphTime = document.createElement('p');
        if (minDate) {
          graphTime.innerText = t('downloadInfo.time');
          graphTime.innerText += toBasicISOString(minDate) + ' - ' + toBasicISOString(new Date());

          graphTime.className = 'p-2 font-semibold';
          element.append(graphTime);
        } else {
          graphTime.innerText = t('downloadInfo.allTime');

          graphTime.className = 'p-2 font-semibold';
          element.append(graphTime);
        }
      }
    });
    const blobCanvas = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('blob does not exist'));
        return resolve(blob);
      });
    });

    await downloadCanvas(`${params.subjectId!.slice(0, 7)}.png`, () => blobCanvas, { blobType: 'image/png' });
  };

  return (
    <div>
      <div className="mb-2">
        <VisualizationHeader minDate={minDate} title={instrument?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="instrument-select-dropdown-container">
              <ActionDropdown
                options={instrumentOptions}
                title={t('visualization.instrument')}
                onSelection={handleSelectForm}
              />
            </div>
            <div data-cy="measure-select-dropdown-container">
              <ListboxDropdown
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
            <div data-cy="time-select-dropdown-container">
              <TimeDropdown setMinTime={setMinDate} />
            </div>
            <div className="relative w-full whitespace-nowrap" data-cy="download-button-container">
              <Button
                className="relative w-full whitespace-nowrap text-sm"
                disabled={!instrument}
                label={t('downloadInfo.download')}
                variant="secondary"
                onClick={() => void handleGraphDownload()}
              />
            </div>
          </div>
        </div>
      </div>
      <Card ref={graphContainerRef}>
        <LineGraph
          data={graphData}
          lines={lines}
          xAxis={{
            key: '__time__',
            label: t('visualization.xLabel')
          }}
        />
      </Card>
    </div>
  );
};
