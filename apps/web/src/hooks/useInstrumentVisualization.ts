import { useEffect, useMemo, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useDownload, useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualScalarInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { SessionType } from '@opendatacapture/schemas/session';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { mapValues, omit } from 'lodash-es';
import { unparse } from 'papaparse';

import { useInstrument } from '@/hooks/useInstrument';
import { useInstrumentInfoById } from '@/hooks/useInstrumentInfoById';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { useAppStore } from '@/store';
import { downloadSubjectTableExcel } from '@/utils/excel';
import { getEditionOptions } from '@/utils/instrument-editions';
import { formatRecordValue } from '@/utils/record-value';

type InstrumentVisualizationRecord = {
  [key: string]: unknown;
  __date__: Date;
  __id__: string;
  /** The scalar instrument actually administered, which varies across a series */
  __instrumentId__: string;
  /** The data collection method, from the session that collected the record */
  __method__: null | SessionType;
  /** The id of the series that collected the record, or null if it was collected individually */
  __seriesId__: null | string;
  /** That series' title, resolved for display; null if collected individually */
  __seriesName__: null | string;
  __subjectId__: string;
  __time__: number;
};

/** The record fields that become fixed metadata columns rather than measure columns */
const EXPORT_METADATA_KEYS = [
  '__date__',
  '__id__',
  '__instrumentId__',
  '__method__',
  '__seriesId__',
  '__seriesName__',
  '__subjectId__',
  '__time__',
  'username'
] as const;

type UseInstrumentVisualizationOptions = {
  params: {
    /**
     * Narrows the records every consumer sees, the export included — which is what keeps a filtered
     * table and its download describing the same set. Must be referentially stable.
     */
    filterRecord?: (record: InstrumentVisualizationRecord) => boolean;
    /** Fixes the instrument rather than leaving it to be chosen, for the per-instrument view */
    instrumentId?: string;
    kind?: InstrumentKind;
    /** Drives the earliest collection date externally, for a view holding it in the URL */
    minDate?: Date;
    /**
     * Every record a series orchestrated, instead of one instrument's. The records then span several
     * scalar instruments, so there is no single instrument to interpret and no coherent wide shape.
     */
    seriesInstrumentId?: string;
    /** Omitted by the per-instrument view, which spans every subject */
    subjectId?: string;
  };
};

export function useInstrumentVisualization({ params }: UseInstrumentVisualizationOptions) {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);

  const download = useDownload();
  const notifications = useNotificationsStore();
  const { t } = useTranslation('common');

  const [allRecords, setRecords] = useState<InstrumentVisualizationRecord[]>([]);
  const [selectedMinDate, setMinDate] = useState<Date | null>(null);
  const [instrumentId, setInstrumentId] = useState<null | string>(params.instrumentId ?? null);

  // A caller holding the date in the URL owns it outright; everyone else drives it with setMinDate.
  const minDate = params.minDate ?? selectedMinDate;

  const filterRecord = params.filterRecord;
  const records = useMemo(
    () => (filterRecord ? allRecords.filter(filterRecord) : allRecords),
    [allRecords, filterRecord]
  );

  // The per-instrument view takes its instrument from the route, so a navigation between editions
  // changes it underneath this hook rather than through setInstrumentId.
  useEffect(() => {
    if (params.instrumentId) {
      setInstrumentId(params.instrumentId);
    }
  }, [params.instrumentId]);

  const instrument = useInstrument(instrumentId) as AnyUnilingualScalarInstrument;
  const seriesInfoById = useInstrumentInfoById({ kind: 'SERIES' });

  const instrumentInfoQuery = useInstrumentInfoQuery({
    params: { allEditions: true, kind: params.kind, subjectId: params.subjectId }
  });
  const recordsQuery = useInstrumentRecords({
    enabled: instrumentId !== null || params.seriesInstrumentId !== undefined,
    params: {
      groupId: currentGroup?.id,
      instrumentId: params.seriesInstrumentId ? undefined : instrumentId!,
      kind: params.kind,
      minDate: minDate ?? undefined,
      seriesInstrumentId: params.seriesInstrumentId,
      subjectId: params.subjectId
    }
  });

  const dl = (option: 'CSV' | 'CSV Long' | 'Excel' | 'Excel Long' | 'JSON' | 'TSV' | 'TSV Long') => {
    if (!instrument && !params.seriesInstrumentId) {
      notifications.addNotification({ message: t('errors.noInstrumentSelected'), type: 'error' });
      return;
    } else if (records.length === 0) {
      notifications.addNotification({ message: t('errors.noDataToExport'), type: 'error' });
      return;
    }

    const instrumentName = instrument ? `${instrument.internal.name}_${instrument.internal.edition}` : 'series';
    const baseFilename = `${currentUser!.username}_${instrumentName}_${new Date().toISOString()}`;

    // One subject's worth of records is named for the subject; an instrument's whole set, which
    // spans subjects, is named for the instrument.
    const sheetName = params.subjectId ? removeSubjectIdScope(params.subjectId) : instrumentName;

    // Split each record into the metadata every exported row repeats and the measures that vary by
    // row, so the long format cannot mistake a metadata field for a measure.
    const exportRecords = records.map((record) => ({
      measures: mapValues(omit(record, EXPORT_METADATA_KEYS), (value) =>
        value instanceof Set ? formatRecordValue(value) : value
      ),
      meta: {
        collectionMethod: record.__method__,
        date: toBasicISOString(record.__date__),
        groupId: currentGroup ? currentGroup.id : DEFAULT_GROUP_NAME,
        seriesId: record.__seriesId__,
        seriesName: record.__seriesName__,
        subjectId: removeSubjectIdScope(record.__subjectId__),
        username: (record.username as null | string) ?? 'N/A'
      }
    }));

    /** Built imperatively because the column order is the header order, which sorting would discard. */
    const withMetadataColumns = (meta: (typeof exportRecords)[number]['meta']) => {
      const row: { [key: string]: any } = {};
      row.GroupID = meta.groupId;
      row.SubjectID = meta.subjectId;
      row.Date = meta.date;
      row.CollectionMethod = meta.collectionMethod;
      row.SeriesID = meta.seriesId;
      row.SeriesName = meta.seriesName;
      row.Username = meta.username;
      return row;
    };

    const makeWideRows = () => {
      return exportRecords.map(({ measures, meta }) => {
        const row = withMetadataColumns(meta);
        for (const [key, value] of Object.entries(measures)) {
          row[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        }
        return row;
      });
    };

    /** A measure holding an array of objects contributes one row per nested key. */
    const expandMeasure = (measureKey: string, measureValue: unknown): { value: unknown; variable: string }[] => {
      if (!Array.isArray(measureValue)) {
        return [{ value: measureValue, variable: measureKey }];
      }
      return measureValue.flatMap((arrayItem) =>
        Object.entries(arrayItem as object).map(([arrayKey, arrayValue]) => ({
          value: arrayValue as unknown,
          variable: `${measureKey}-${arrayKey}`
        }))
      );
    };

    const makeLongRows = () => {
      const longRecords: { [key: string]: any }[] = [];

      for (const { measures, meta } of exportRecords) {
        for (const [measureKey, measureValue] of Object.entries(measures)) {
          for (const { value, variable } of expandMeasure(measureKey, measureValue)) {
            const row = withMetadataColumns(meta);
            row.Variable = variable;
            row.Value = value;
            longRecords.push(row);
          }
        }
      }

      return longRecords;
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
        downloadSubjectTableExcel(`${baseFilename}.xlsx`, rows, sheetName);
        break;
      }
      case 'Excel Long': {
        const rows = makeLongRows();
        downloadSubjectTableExcel(`${baseFilename}.xlsx`, rows, sheetName);
        break;
      }
      case 'JSON': {
        const rows = makeWideRows();
        void download(`${baseFilename}.json`, () => Promise.resolve(JSON.stringify(rows, null, 2)));
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
          const seriesId = record.seriesInstrumentId ?? null;

          return {
            __date__: record.date,
            __id__: record.id,
            __instrumentId__: record.instrumentId,
            __method__: record.session?.type ?? null,
            __seriesId__: seriesId,
            __seriesName__: seriesId ? (seriesInfoById[seriesId]?.title ?? null) : null,
            __subjectId__: record.subjectId,
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
          es: 'Se produjo un error al buscar los registros',
          fr: "Une erreur s'est produite lors de la recherche des enregistrements."
        }),
        type: 'error'
      });
    }
  }, [recordsQuery.data, seriesInfoById]);

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

  const editionLabel = t({ en: 'Edition', es: 'Edición', fr: 'Édition' });
  const editionOptions = useMemo(
    () => getEditionOptions(instrumentInfoQuery.data ?? [], instrumentId, editionLabel),
    [instrumentInfoQuery.data, instrumentId, editionLabel]
  );

  return {
    /** Every record for the instrument, before `filterRecord` — what a filter's own options come from */
    allRecords,
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
