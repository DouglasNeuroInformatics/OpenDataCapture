import React from 'react';

import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { SelectInstrument } from '../components/SelectInstrument';
import { TimeDropdown } from '../components/TimeDropdown';
import { useInstrumentVisualization } from '../hooks/useInstrumentVisualization';

export const SubjectTablePage = () => {
  const params = useParams();
  const { dl, instrumentId, instrumentOptions, records, setInstrumentId, setMinDate } = useInstrumentVisualization({
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
      <div className="mb-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row" data-cy="select-instrument-dropdown-container">
            <SelectInstrument options={instrumentOptions} onSelect={setInstrumentId} />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div data-cy="time-dropdown-container">
              <TimeDropdown disabled={!instrumentId} setMinTime={setMinDate} />
            </div>
            <div data-cy="download-dropdown-container">
              <ActionDropdown
                widthFull
                disabled={!instrumentId}
                options={['CSV', 'JSON']}
                title={t('core:download')}
                triggerClassName="min-w-32"
                onSelection={dl}
              />
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
        entriesPerPage={15}
        minRows={15}
      />
    </div>
  );
};
