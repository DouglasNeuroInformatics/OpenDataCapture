import { useEffect, useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { omit } from 'lodash-es';
import { unparse } from 'papaparse';

import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { useAppStore } from '@/store';
import { downloadSubjectTableExcel } from '@/utils/excel';

type InstrumentVisualizationRecord = {
  [key: string]: unknown;
  __date__: Date;
  __id__: string;
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
    params: { allEditions: true, kind: params.kind, subjectId: params.subjectId }
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

  const dl = (option: 'CSV' | 'CSV Long' | 'Excel' | 'Excel Long' | 'JSON' | 'TSV' | 'TSV Long') => {
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

    const exportRecords = records.map((record) => omit(record, ['__time__', '__id__']));

    const makeWideRows = () => {
      const columnNames = Object.keys(exportRecords[0]!);
      return exportRecords.map((item) => {
        const obj: { [key: string]: any } = {
          GroupID: currentGroup ? currentGroup.id : 'root',
          subjectId: removeSubjectIdScope(params.subjectId)
        };
        for (const key of columnNames) {
          const val = item[key];
          if (key === '__date__') {
            obj.Date = toBasicISOString(val as Date);
            continue;
          }
          if (key === 'username') {
            obj.Username = val;
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
        let username = 'N/A';

        Object.entries(item).forEach(([objKey, objVal]) => {
          if (objKey === '__date__') {
            date = objVal as Date;
            return;
          }
          if (objKey === 'username') {
            username = objVal as string;
            return;
          }

          if (Array.isArray(objVal)) {
            objVal.forEach((arrayItem) => {
              Object.entries(arrayItem as object).forEach(([arrKey, arrItem]) => {
                longRecord.push({
                  GroupID: currentGroup ? currentGroup.id : 'root',
                  // eslint-disable-next-line perfectionist/sort-objects
                  Date: toBasicISOString(date),
                  SubjectID: removeSubjectIdScope(params.subjectId),
                  Username: username,
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
              SubjectID: removeSubjectIdScope(params.subjectId),
              Username: username,
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
      case 'Excel': {
        const rows = makeWideRows();
        downloadSubjectTableExcel(`${baseFilename}.xlsx`, rows, removeSubjectIdScope(params.subjectId));
        break;
      }
      case 'Excel Long': {
        const rows = makeLongRows();
        downloadSubjectTableExcel(`${baseFilename}.xlsx`, rows, removeSubjectIdScope(params.subjectId));
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
    try {
      if (recordsQuery.data) {
        const records: InstrumentVisualizationRecord[] = recordsQuery.data.map((record) => {
          const props = record.data && typeof record.data === 'object' ? record.data : {};

          return {
            __date__: record.date,
            __id__: record.id,
            __time__: record.date.getTime(),
            username: record.session?.user?.username ?? 'N/A',
            ...record.computedMeasures,
            ...props
          };
        });

        setRecords(records);
      }
    } catch (error) {
      console.error(error);
      notifications.addNotification({
        message: t({
          en: 'Error occurred finding records',
          fr: "Une erreur s'est produite lors de la recherche des enregistrements."
        }),
        type: 'error'
      });
    }
  }, [recordsQuery.data]);

  const instrumentOptions: { [key: string]: string } = useMemo(() => {
    // only show the latest edition of each instrument; older editions are selectable via editionOptions
    const latestInstruments = new Map<string, TranslatedInstrumentInfo>();
    for (const info of instrumentInfoQuery.data ?? []) {
      const key = info.kind !== 'SERIES' ? info.internal.name : info.id;
      const currentEntry = latestInstruments.get(key);
      const currentEdition = currentEntry && currentEntry.kind !== 'SERIES' ? currentEntry.internal.edition : 0;
      const infoEdition = info.kind !== 'SERIES' ? info.internal.edition : 0;
      if (!currentEntry || infoEdition > currentEdition) {
        latestInstruments.set(key, info);
      }
    }
    const options: { [key: string]: string } = {};
    for (const info of latestInstruments.values()) {
      options[info.id] = info.details.title;
    }
    return options;
  }, [instrumentInfoQuery.data]);

  const editionOptions: { [key: string]: string } = useMemo(() => {
    const infos = instrumentInfoQuery.data ?? [];
    const selected = infos.find((info) => info.id === instrumentId);
    if (!selected || selected.kind === 'SERIES') {
      return {};
    }
    const selectedName = selected.internal.name;
    const options: { [key: string]: string } = {};
    infos
      .filter((info): info is typeof selected => info.kind !== 'SERIES' && info.internal.name === selectedName)
      .sort((a, b) => a.internal.edition - b.internal.edition)
      .forEach((info) => {
        options[info.id] = `${t({ en: 'Edition', fr: 'Édition' })} ${info.internal.edition}`;
      });
    return options;
  }, [instrumentInfoQuery.data, instrumentId]);

  return {
    dl,
    editionOptions,
    instrument,
    instrumentId,
    instrumentOptions,
    minDate,
    records,
    setInstrumentId,
    setMinDate
  };
}

export type { InstrumentVisualizationRecord };
