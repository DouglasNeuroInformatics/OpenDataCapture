import { useMemo } from 'react';

import { camelToSnakeCase, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { ActionDropdown, DataTable, TanstackTable } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { SelectEdition } from '@/components/SelectEdition';
import { SelectInstrument } from '@/components/SelectInstrument';
import { TimeDropdown } from '@/components/TimeDropdown';
import { useInstrumentVisualization } from '@/hooks/useInstrumentVisualization';
import type { InstrumentVisualizationRecord } from '@/hooks/useInstrumentVisualization';

const RouteComponent = () => {
  const navigate = Route.useNavigate();
  const params = Route.useParams();
  const { dl, editionOptions, instrumentId, instrumentOptions, records, setInstrumentId, setMinDate } =
    useInstrumentVisualization({
      params: { subjectId: params.subjectId }
    });

  const { t } = useTranslation();

  const columns = useMemo<TanstackTable.ColumnDef<InstrumentVisualizationRecord>[]>(() => {
    const columns: TanstackTable.ColumnDef<InstrumentVisualizationRecord>[] = [];
    for (const subItem in records[0]) {
      if (!subItem.startsWith('__')) {
        columns.push({
          accessorKey: subItem,
          cell: (ctx) => {
            const value = ctx.getValue();
            return (
              <p
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                data-testid={`subject-table-cell-${subItem}`}
              >
                {String(value)}
              </p>
            );
          },
          header: camelToSnakeCase(subItem).toUpperCase(),
          id: subItem
        });
      }
    }
    return columns;
  }, [records[0]]);

  return (
    <div>
      <div className="mb-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row">
            <SelectInstrument options={instrumentOptions} onSelect={setInstrumentId} />
            <SelectEdition options={editionOptions} value={instrumentId} onSelect={setInstrumentId} />
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
      {/* libui's `DataTable` drops a `data-testid`, so the record table's selector goes on a
          wrapper. The Table tab link is `subject-table-tab`. */}
      <div data-testid="subject-table">
        <DataTable
          disableSearch
          columns={[
            {
              accessorKey: '__date__',
              cell: (ctx) => {
                const value = ctx.getValue();
                if (value instanceof Date) {
                  return toBasicISOString(value);
                }
                return value;
              },
              header: 'DATE_COLLECTED'
            },
            ...columns
          ]}
          data={records}
          rowActions={[
            {
              label: t('common.view'),
              onSelect: (row) => {
                void navigate({ params: { recordId: row.__id__ }, to: './$recordId' });
              }
            }
          ]}
          onRowDoubleClick={(row) => {
            void navigate({ params: { recordId: row.__id__ }, to: './$recordId' });
          }}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/datahub/$subjectId/table/')({
  component: RouteComponent
});
