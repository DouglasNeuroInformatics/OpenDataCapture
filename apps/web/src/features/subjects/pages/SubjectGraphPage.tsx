import { useRef, useState } from 'react';

import { Dropdown, LineGraph, SelectDropdown, type SelectOption } from '@douglasneuroinformatics/ui/legacy';
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

  const lineGraphRef = useRef<HTMLDivElement>(null);

  const downloadDivAsImage = (format: string) => {
    const divToCapture = lineGraphRef.current;

    if (!divToCapture) {
      console.error(`Ref not set.`);
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context unavailable.');
      return;
    }

    // Set canvas dimensions to match the div
    canvas.width = divToCapture.offsetWidth;
    canvas.height = divToCapture.offsetHeight;

    // Convert the div content to a blob
    const svgString = new XMLSerializer().serializeToString(divToCapture);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

    // Create an image element from the SVG blob
    const image = new Image();
    const url = URL.createObjectURL(svgBlob);

    image.onload = () => {
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      // Convert the canvas content to a data URL
      const imageDataUrl = canvas.toDataURL(`image/${format.toLowerCase()}`);

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = format;

      // Trigger the download
      link.click();
    };
    image.src = url;
  };

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader minDate={minDate} title={instrument?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
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
            <div data-cy="download-dropdown">
              <Dropdown
                className="text-sm"
                options={['PNG', 'JPEG']}
                title={t('core:download')}
                variant="secondary"
                onSelection={(format) => downloadDivAsImage(format)}
              />
            </div>
          </div>
        </div>
      </div>
      <div ref={lineGraphRef}>
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
