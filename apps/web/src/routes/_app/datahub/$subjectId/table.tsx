import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, ClientTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { SelectInstrument } from '@/components/SelectInstrument';
import { TimeDropdown } from '@/components/TimeDropdown';
import { useInstrumentVisualization } from '@/hooks/useInstrumentVisualization';

const RouteComponent = () => {
  const params = Route.useParams();
  const { dl, instrumentId, instrumentOptions, records, setInstrumentId, setMinDate } = useInstrumentVisualization({
    params: { subjectId: params.subjectId }
  });

  const { t } = useTranslation();

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
          <div className="flex">
            <SelectInstrument options={instrumentOptions} onSelect={setInstrumentId} />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <TimeDropdown disabled={!instrumentId} setMinTime={setMinDate} />
            <ActionDropdown
              widthFull
              data-spotlight-type="export-data-dropdown"
              disabled={!instrumentId}
              options={['TSV', 'TSV Long', 'JSON', 'CSV', 'CSV Long', 'Excel', 'Excel Long']}
              title={t('core.download')}
              triggerClassName="min-w-32"
              onSelection={dl}
            />
          </div>
        </div>
      </div>
      <ClientTable
        noWrap
        columns={[
          {
            field: '__date__',
            formatter: (value: Date) => toBasicISOString(value),
            label: 'DATE_COLLECTED'
          },
          ...fields
        ]}
        data={records}
        data-cy="subject-table"
        entriesPerPage={15}
        minRows={15}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/$subjectId/table')({
  component: RouteComponent
});
