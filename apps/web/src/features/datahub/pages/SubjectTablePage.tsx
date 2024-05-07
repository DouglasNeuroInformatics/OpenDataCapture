import React from 'react';

import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { TimeDropdown } from '../components/TimeDropdown';
import { VisualizationHeader } from '../components/VisualizationHeader';
import { useInstrumentVisualization } from '../hooks/useInstrumentVisualization';

export const SubjectTablePage = () => {
  const params = useParams();
  const { dl, instrument, instrumentOptions, minDate, records, setInstrumentId, setMinDate } =
    useInstrumentVisualization({
      params: { subjectId: params.subjectId! }
    });

  const { t } = useTranslation(['datahub', 'core']);

  const fields: { field: string; label: string }[] = [];
  for (const subItem in records[0]) {
    if (!subItem.startsWith('__')) {
      fields.push({
        field: subItem,
        label: camelToSnakeCase(subItem).toUpperCase()
      });
    }
  }

  return (
    <div>
      <div className="my-2">
        <VisualizationHeader minDate={minDate} title={instrument?.details.title} />
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row" data-cy="select-instrument-dropdown-container">
            <ActionDropdown
              options={instrumentOptions}
              title={t('visualization.instrument')}
              onSelection={setInstrumentId}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="time-dropdown-container">
              <TimeDropdown setMinTime={setMinDate} />
            </div>

            <div data-cy="download-dropdown-container">
              <ActionDropdown options={['CSV', 'JSON']} title={t('core:download')} onSelection={dl} />
            </div>
          </div>
        </div>
      </div>
      <ClientTable
        columns={[
          {
            field: '__date__',
            formatter: (value: Date) => toBasicISOString(value),
            label: 'DATE_COLLECTED'
          },
          ...fields
        ]}
        data={records}
        minRows={10}
      />
    </div>
  );
};
