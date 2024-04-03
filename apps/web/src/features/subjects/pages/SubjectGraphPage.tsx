import { useRef, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useDownload } from '@douglasneuroinformatics/libui/hooks';
import { Button, Dropdown, LineGraph, SelectDropdown, type SelectOption } from '@douglasneuroinformatics/ui/legacy';
import html2canvas from 'html2canvas';
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
  const downloadCanvas = useDownload();
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

  const graphRef = useRef<HTMLDivElement>(null);

  const handleSelectForm = (id: string) => {
    setInstrumentId(id);
    setSelectedMeasures([]);
  };

  const handleGraphDownload = async () => {
    if (!graphRef.current) return;

    const selectGraph = graphRef.current;

    const canvas = await html2canvas(selectGraph, {
      onclone: (_, element) => {
        const graphDesc = document.createElement('div');
        graphDesc.innerText = instrument!.details.title + ' of Subject: ' + params.subjectId!.slice(0, 7);
        graphDesc.className = 'p-2 font-semibold text-center';
        element.prepend(graphDesc);

        if (selectedMeasures) {
          const graphMeasure = document.createElement('div');
          graphMeasure.innerText = 'Form of Measurement: ';
          for (const i of selectedMeasures) {
            graphMeasure.innerText = graphMeasure.innerText + i.label + ' ';
          }
          graphMeasure.className = 'p-2 font-semibold';
          element.append(graphMeasure);
        }

        const graphTime = document.createElement('div');
        if (minDate) {
          graphTime.innerText = 'Time frame: ' + toBasicISOString(minDate) + ' - ' + toBasicISOString(new Date());

          graphTime.className = 'p-2 font-semibold';
          element.append(graphTime);
        } else {
          graphTime.innerText = 'Time frame: All-Time';

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
                disabled={!instrument}
                label="Download"
                variant="secondary"
                onClick={() => void handleGraphDownload()}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="print:h-[400px] print:w-[400px]" ref={graphRef}>
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
