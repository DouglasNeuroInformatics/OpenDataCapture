import { useEffect, useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { omit } from 'lodash-es';
import { unparse } from 'papaparse';

import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { useAppStore } from '@/store';
import { downloadSubjectTableExcel } from '@/utils/excel';

import { sessionInfo } from './useFindSession';
import { userInfo } from './useFindUser';

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

  // Create a new sessionsUsernameQuery which uses the useFindSessionQuery hook
  // have use a different return type with

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

    const exportRecords = records.map((record) => omit(record, ['__time__']));

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
    let cancelled = false;
    const fetchRecords = async () => {
      try {
        if (recordsQuery.data) {
          // Fetch all sessions in parallel
          const sessionPromises = recordsQuery.data.map((record) => sessionInfo(record.sessionId));
          const sessions = await Promise.all(sessionPromises);

          // Extract unique userIds and fetch users in parallel
          const userIds = [...new Set(sessions.filter((s) => s?.userId).map((s) => s.userId))];

          //assume userId exists in userId set as we already filtered out the non-existing userIds
          const userPromises = userIds.map((userId) => userInfo(userId!).catch(() => null));
          const users = await Promise.all(userPromises);
          const userMap = new Map(users.filter((u) => u).map((u) => [u!.id, u!.username]));

          // Build records with looked-up data
          const records: InstrumentVisualizationRecord[] = recordsQuery.data.map((record, i) => {
            const props = record.data && typeof record.data === 'object' ? record.data : {};
            const session = sessions[i];
            const username = session?.userId ? (userMap.get(session.userId) ?? 'N/A') : 'N/A';

            return {
              __date__: record.date,
              __time__: record.date.getTime(),
              username: username,
              ...record.computedMeasures,
              ...props
            };
          });

          if (!cancelled) {
            setRecords(records);
          }
        }
      } catch (error) {
        console.error('Error occurred: ', error);
        notifications.addNotification({
          message: t({
            en: 'Error occurred finding records',
            fr: "Une erreur s'est produite lors de la recherche des enregistrements."
          }),
          type: 'error'
        });
      }
    };
    void fetchRecords();
    return () => {
      cancelled = true;
    };
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
