import { useEffect, useMemo, useState } from 'react';

import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import { omit } from 'lodash-es';

import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { useAppStore } from '@/store';
import { parse, unparse } from 'papaparse';

type InstrumentVisualizationRecord = {
  [key: string]: unknown;
  __date__: Date;
  __time__: number;
};

type UseInstrumentVisualizationOptions = {
  params: {
    kind?: InstrumentKind;
    subjectId: string;
  };
};

export function useInstrumentVisualization({ params }: UseInstrumentVisualizationOptions) {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const download = useDownload();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('common');

  const [records, setRecords] = useState<InstrumentVisualizationRecord[]>([]);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [instrumentId, setInstrumentId] = useState<null | string>(null);

  const instrument = useInstrument(instrumentId) as AnyUnilingualScalarInstrument;

  const instrumentInfoQuery = useInstrumentInfoQuery({
    params: { kind: params.kind, subjectId: params.subjectId }
  });
  const recordsQuery = useInstrumentRecords({
    enabled: instrumentId !== null,
    params: {
      groupId: currentGroup?.id,
      instrumentId: instrumentId!,
      kind: params.kind,
      minDate: minDate ?? undefined,
      subjectId: params.subjectId
    }
  });

  const dl = (option: 'JSON' | 'TSV' | 'CSV') => {
    if (!instrument) {
      notifications.addNotification({ message: t('errors.noInstrumentSelected'), type: 'error' });
      return;
    } else if (records.length === 0) {
      notifications.addNotification({ message: t('errors.noDataToExport'), type: 'error' });
      return;
    }

    const baseFilename = `${currentUser!.username}_${instrument.internal.name}_${
      instrument.internal.edition
    }_${new Date().toISOString()}`;

    const exportRecords = records.map((record) => omit(record, ['__date__', '__time__']));

    switch (option) {
      case 'JSON':
        void download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(exportRecords, null, 2)));
        break;
      case 'TSV':
        void download(`${baseFilename}.tsv`, () => {
          const columnNames = Object.keys(exportRecords[0]!).join('\t');
          const rows = exportRecords
            .map((item) =>
              Object.values(item)
                .map((val) => JSON.stringify(val))
                .join('\t')
            )
            .join('\n');
          return columnNames + '\n' + rows;
        });
        break;
      case 'CSV':
        void download(`${baseFilename}.csv`, () => {
          const columnNames = Object.keys(exportRecords[0]!).join(',');
          const rows = exportRecords
            .map((item) =>
              Object.values(item)
                .map((val) => '"' + JSON.stringify(val) + '"')
                .join(',')
            )
            .join('\n');

          const transformed = columnNames + '\n' + rows;

          const parsed = parse(transformed, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
          });

          return transformed;
        });
        break;
    }
  };

  useEffect(() => {
    if (recordsQuery.data) {
      const records: InstrumentVisualizationRecord[] = [];
      for (const record of recordsQuery.data) {
        const props = record.data && typeof record.data === 'object' ? record.data : {};
        records.push({
          __date__: record.date,
          __time__: record.date.getTime(),
          ...record.computedMeasures,
          ...props
        });
      }
      setRecords(records);
    }
  }, [recordsQuery.data]);

  const instrumentOptions: { [key: string]: string } = useMemo(() => {
    const options: { [key: string]: string } = {};
    for (const instrument of instrumentInfoQuery.data ?? []) {
      options[instrument.id] = instrument.details.title;
    }
    return options;
  }, [instrumentInfoQuery.data]);

  return { dl, instrument, instrumentId, instrumentOptions, minDate, records, setInstrumentId, setMinDate };
}

export type { InstrumentVisualizationRecord };
