import { useEffect, useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import { omit } from 'lodash-es';
import { unparse } from 'papaparse';

import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { useAppStore } from '@/store';

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

  function afterFirstDollar(str: string) {
    const match = /\$(.*)/.exec(str);
    if (!match) return str;
    if (!match[1]) return str;
    return match[1];
  }

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

  const dl = (option: 'CSV' | 'CSV Long' | 'JSON' | 'TSV' | 'TSV Long') => {
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

    const exportRecords = records.map((record) => omit(record, ['__time__']));

    const makeWideRows = () => {
      const columnNames = Object.keys(exportRecords[0]!);
      return exportRecords.map((item) => {
        const obj: { [key: string]: any } = {
          GroupID: currentGroup ? currentGroup.id : 'root',
          subjectId: afterFirstDollar(params.subjectId)
        };
        for (const key of columnNames) {
          const val = item[key];
          if (key === '__date__') {
            obj.Date = toBasicISOString(val as Date);
            continue;
          }
          obj[key] = typeof val === 'object' ? JSON.stringify(val) : val;
        }
        return obj;
      });
    };

    const makeLongRows = () => {
      const longRecord: { [key: string]: any }[] = [];

      exportRecords.forEach((item) => {
        let date: Date;

        Object.entries(item).forEach(([objKey, objVal]) => {
          if (objKey === '__date__') {
            date = objVal as Date;
            return;
          }

          if (Array.isArray(objVal)) {
            objVal.forEach((arrayItem) => {
              Object.entries(arrayItem as object).forEach(([arrKey, arrItem]) => {
                longRecord.push({
                  GroupID: currentGroup ? currentGroup.id : 'root',
                  // eslint-disable-next-line perfectionist/sort-objects
                  Date: toBasicISOString(date),
                  SubjectID: afterFirstDollar(params.subjectId),
                  Variable: `${objKey}-${arrKey}`,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, perfectionist/sort-objects
                  Value: arrItem
                });
              });
            });
          } else {
            longRecord.push({
              GroupID: currentGroup ? currentGroup.id : 'root',
              // eslint-disable-next-line perfectionist/sort-objects
              Date: toBasicISOString(date),
              SubjectID: afterFirstDollar(params.subjectId),
              Value: objVal,
              Variable: objKey
            });
          }
        });
      });

      return longRecord;
    };

    const parseHelper = (rows: unknown[], delimiter: string) => {
      return unparse(rows, {
        delimiter: delimiter,
        escapeChar: '"',
        header: true,
        quoteChar: '"',
        quotes: false,
        skipEmptyLines: true
      });
    };

    switch (option) {
      case 'CSV':
        void download(`${baseFilename}.csv`, () => {
          const rows = makeWideRows();
          const csv = parseHelper(rows, ',');

          return csv;
        });
        break;
      case 'CSV Long': {
        void download(`${baseFilename}.csv`, () => {
          const rows = makeLongRows();
          const csv = parseHelper(rows, ',');
          return csv;
        });
        break;
      }
      case 'JSON': {
        exportRecords.map((item) => {
          item.subjectID = params.subjectId;
        });
        void download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(exportRecords, null, 2)));
        break;
      }
      case 'TSV':
        void download(`${baseFilename}.tsv`, () => {
          const rows = makeWideRows();
          const tsv = parseHelper(rows, '\t');

          return tsv;
        });
        break;
      case 'TSV Long':
        void download(`${baseFilename}.tsv`, () => {
          const rows = makeLongRows();
          const tsv = parseHelper(rows, '\t');

          return tsv;
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
