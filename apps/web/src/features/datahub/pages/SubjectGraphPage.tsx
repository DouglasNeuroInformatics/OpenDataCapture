import React, { useRef, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import {
  ActionDropdown,
  LineGraph,
  ListboxDropdown,
  type ListboxDropdownOption
} from '@douglasneuroinformatics/libui/components';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAppStore } from '@/store';

import { SelectInstrument } from '../components/SelectInstrument';
import { TimeDropdown } from '../components/TimeDropdown';
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
      params: {
        kind: 'FORM',
        subjectId: params.subjectId!
      }
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
          selectedMeasures.map((measure) => measure.label).join(', ');
          graphMeasure.innerText += selectedMeasures.map((measure) => measure.label).join(', ');
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
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="instrument-select-dropdown-container">
              <SelectInstrument
                options={instrumentOptions}
                onSelect={(id) => {
                  setInstrumentId(id);
                  setSelectedMeasures([]);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="measure-select-dropdown-container">
              <ListboxDropdown
                widthFull
                checkPosition="right"
                contentClassName="min-w-72"
                disabled={!instrumentId}
                options={measureOptions}
                selected={selectedMeasures}
                setSelected={setSelectedMeasures}
                title={t('visualization.measures')}
                variant="secondary"
              />
            </div>
            <div data-cy="time-select-dropdown-container">
              <TimeDropdown disabled={!instrumentId} setMinTime={setMinDate} />
            </div>
            <div className="relative w-full whitespace-nowrap" data-cy="download-button-container">
              <ActionDropdown
                widthFull
                disabled={!instrumentId}
                options={{
                  png: 'PNG'
                }}
                title={t('downloadInfo.download')}
                onSelection={() => {
                  void handleGraphDownload();
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="bg-card text-muted-foreground rounded-md border p-6 tracking-tight shadow-sm"
        ref={graphContainerRef}
      >
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
