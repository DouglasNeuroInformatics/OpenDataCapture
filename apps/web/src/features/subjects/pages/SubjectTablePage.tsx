import { ClientTable, Dropdown } from '@douglasneuroinformatics/ui/legacy';
import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/utils';
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

  const { t } = useTranslation(['subjects', 'core']);

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
          <div className="flex flex-col gap-2 lg:flex-row">
            <Dropdown
              className="text-sm"
              options={instrumentOptions}
              title={t('visualization.instrument')}
              variant="secondary"
              onSelection={setInstrumentId}
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <TimeDropdown setMinTime={setMinDate} />
            <Dropdown
              className="text-sm"
              options={['CSV', 'JSON']}
              title={t('core:download')}
              variant="secondary"
              onSelection={dl}
            />
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
