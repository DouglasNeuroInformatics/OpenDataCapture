import { Readable } from 'node:stream';

import { InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable, NotFoundException, StreamableFile, UnprocessableEntityException } from '@nestjs/common';
import { translateInstrument } from '@opendatacapture/instrument-utils';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import {
  INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS,
  INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS,
  INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE
} from '@opendatacapture/schemas/instrument-records';
import type {
  $ExportInstrumentRecordsData,
  InstrumentRecordsExport,
  InstrumentRecordsExportFrame
} from '@opendatacapture/schemas/instrument-records';
import type { SessionType } from '@opendatacapture/schemas/session';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { Packr } from 'msgpackr';

import { accessibleQuery, forcedAppSubject } from '@/auth/ability.utils';
import type { AppAbility } from '@/auth/auth.types';
import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';

type ExportInstrumentInfo = {
  edition: number;
  id: string;
  name: string;
};

type ScalarMeasureValue = boolean | Date | number | string | undefined;

export type RawExportRecord = {
  computedMeasures: null | { [key: string]: null | ScalarMeasureValue | { [key: string]: ScalarMeasureValue }[] };
  date: string;
  /** Null for a record belonging to no group; the pipeline normalises a missing field to null. */
  groupId: null | string;
  id: string;
  instrumentId: string;
  /** Null for a record collected outside any series */
  seriesInstrumentId: null | string;
  session: {
    date: null | string;
    groupId: null | string;
    id: string;
    type: null | SessionType;
    user: {
      username: null | string;
    };
  };
  subject: {
    age: null | number;
    groupIds: string[];
    id: string;
    sex: null | string;
  };
};

@Injectable()
export class InstrumentRecordsExportService {
  constructor(
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    private readonly instrumentsService: InstrumentsService,
    private readonly loggingService: LoggingService
  ) {}

  async exportRecords(
    { groupId, subjectIds }: $ExportInstrumentRecordsData,
    { ability, callerGroupIds }: Required<Pick<EntityOperationOptions, 'ability'>> & { callerGroupIds?: string[] }
  ): Promise<StreamableFile> {
    const matchedRecords = await this.instrumentRecordModel.findMany({
      select: { id: true, instrumentId: true, seriesInstrumentId: true },
      take: INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS + 1,
      where: {
        AND: [
          accessibleQuery(ability, 'read', 'InstrumentRecord'),
          { groupId },
          { subjectId: subjectIds ? { in: subjectIds } : undefined },
          // records created before the file instrument feature do not have the pending field at all,
          // and prisma NOT filters on mongodb exclude documents where the field is missing entirely
          { OR: [{ pending: { isSet: false } }, { pending: null }, { pending: false }] }
        ]
      }
    });

    if (matchedRecords.length > INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS) {
      throw new UnprocessableEntityException(
        `Export exceeds the maximum of ${INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS} records; narrow the filters and try again`
      );
    }

    const instrumentIds = new Set(matchedRecords.map((record) => record.instrumentId));
    const instrumentsArray = await Promise.all(
      instrumentIds.values().map(async (id) => {
        const instrument = await this.instrumentsService.findById(id);
        if (instrument.kind === 'SERIES') {
          throw new UnprocessableEntityException(`Instrument '${id}' is a series instrument, not a scalar instrument`);
        }
        return instrument;
      })
    );
    const instruments = new Map<string, ExportInstrumentInfo>(
      instrumentsArray.map((instrument) => [
        instrument.id,
        {
          edition: instrument.internal.edition,
          id: instrument.id,
          name: instrument.internal.name
        }
      ])
    );

    const seriesNames = await this.resolveSeriesNames(matchedRecords, { ability, callerGroupIds });
    const recordIds = matchedRecords.map((record) => record.id);

    const packr = new Packr({ sequential: true, useRecords: true });
    const generateChunks = async function* (this: InstrumentRecordsExportService): AsyncGenerator<Buffer> {
      try {
        let rowCount = 0;
        for (let offset = 0; offset < recordIds.length; offset += INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE) {
          const pageIds = recordIds.slice(offset, offset + INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE);
          const rawPage = await this.queryExportPage(pageIds);
          const rows = this.expandRecords(rawPage, { ability, instruments, seriesNames });
          rowCount += rows.length;
          for (let rowOffset = 0; rowOffset < rows.length; rowOffset += INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS) {
            const frameRows = rows.slice(rowOffset, rowOffset + INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS);
            yield this.packFrame(packr, { done: false, rows: frameRows });
          }
        }
        yield this.packFrame(packr, { done: true, rowCount });
      } catch (error) {
        this.loggingService.error({
          error,
          message: 'Failed to stream instrument records export page'
        });
        throw error;
      }
    }.bind(this);

    return new StreamableFile(Readable.from(generateChunks(), { highWaterMark: 1, objectMode: false }), {
      type: 'application/x-msgpack'
    });
  }

  private expandRecords(
    records: RawExportRecord[],
    context: {
      ability: AppAbility;
      instruments: ReadonlyMap<string, ExportInstrumentInfo>;
      seriesNames: Readonly<{ [id: string]: string }>;
    }
  ): InstrumentRecordsExport {
    const rows: InstrumentRecordsExport = [];

    for (const record of records) {
      const instrument = context.instruments.get(record.instrumentId);
      if (!instrument) {
        throw new Error(`Instrument not found for ID: ${record.instrumentId}`);
      }

      if (!record.computedMeasures) {
        continue;
      }

      const canReadSession = context.ability.can(
        'read',
        forcedAppSubject('Session', { groupId: record.session.groupId })
      );
      const canReadSubject = context.ability.can(
        'read',
        forcedAppSubject('Subject', { groupIds: record.subject.groupIds })
      );
      const groupId = record.groupId ?? DEFAULT_GROUP_NAME;
      const seriesId = record.seriesInstrumentId;
      const seriesName = seriesId ? (context.seriesNames[seriesId] ?? null) : null;
      const sessionDate = canReadSession ? record.session.date : null;
      const sessionType = canReadSession ? record.session.type : null;
      const subjectAge = canReadSubject ? record.subject.age : null;
      const subjectId = removeSubjectIdScope(record.subject.id);
      const subjectSex = canReadSubject ? record.subject.sex : null;
      const username = (canReadSession ? record.session.user.username : null) ?? 'N/A';

      for (const [measureKey, measureValue] of Object.entries(record.computedMeasures)) {
        if (measureValue === null || measureValue === undefined) {
          continue;
        }

        if (!Array.isArray(measureValue)) {
          rows.push({
            groupId,
            instrumentEdition: instrument.edition,
            instrumentName: instrument.name,
            measure: measureKey,
            seriesId,
            seriesName,
            sessionDate,
            sessionId: record.session.id,
            sessionType,
            subjectAge,
            subjectId,
            subjectSex,
            timestamp: record.date,
            username,
            value: measureValue
          });
          continue;
        }

        for (const entry of measureValue) {
          for (const [entryKey, entryValue] of Object.entries(entry)) {
            rows.push({
              groupId,
              instrumentEdition: instrument.edition,
              instrumentName: instrument.name,
              measure: `${measureKey} - ${entryKey}`,
              seriesId,
              seriesName,
              sessionDate,
              sessionId: record.session.id,
              sessionType,
              subjectAge,
              subjectId,
              subjectSex,
              timestamp: record.date,
              username,
              value: entryValue
            });
          }
        }
      }
    }

    return rows;
  }

  private packFrame(packr: Packr, frame: InstrumentRecordsExportFrame): Buffer {
    const payload = packr.pack(frame);
    const framed = Buffer.allocUnsafe(4 + payload.byteLength);
    framed.writeUInt32BE(payload.byteLength, 0);
    framed.set(payload, 4);
    return framed;
  }

  /**
   * Fetch and join one page of export records by `_id`.
   *
   * Scoped by `recordIds`, which `exportRecords` already filtered through `accessibleQuery` on the
   * caller's ability before paging.
   */
  private async queryExportPage(recordIds: string[]): Promise<RawExportRecord[]> {
    const pipeline = [
      {
        $match: {
          _id: { $in: recordIds.map((id) => ({ $oid: id })) }
        }
      },
      {
        // Join with Session collection
        $lookup: {
          as: 'session',
          foreignField: '_id',
          from: 'SessionModel',
          localField: 'sessionId'
        }
      },
      { $unwind: { path: '$session', preserveNullAndEmptyArrays: true } },
      {
        // session.userId is an ObjectId reference to UserModel, but a small number of legacy
        // sessions have it stored as a plain string; $convert normalizes both to a real ObjectId
        // (or null, if the session has no user) so the following $lookup can match on it.
        $addFields: {
          'session.userObjectId': {
            $convert: { input: '$session.userId', onError: null, onNull: null, to: 'objectId' }
          }
        }
      },
      {
        // Join with User collection, to resolve the username of whoever ran the session
        $lookup: {
          as: 'sessionUser',
          foreignField: '_id',
          from: 'UserModel',
          localField: 'session.userObjectId'
        }
      },
      { $unwind: { path: '$sessionUser', preserveNullAndEmptyArrays: true } },
      {
        // Join with Subject collection
        $lookup: {
          as: 'subject',
          foreignField: '_id',
          from: 'SubjectModel',
          localField: 'subjectId'
        }
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          computedMeasures: { $ifNull: ['$computedMeasures', null] },
          date: {
            $dateToString: {
              date: '$createdAt',
              format: '%Y-%m-%d'
            }
          },
          // `$ifNull` is load-bearing across nullable and left-joined fields: in MongoDB `$project`,
          // an expression referencing a missing field omits the output key rather than setting null,
          // and `SessionsService.deleteById` / non-force `SubjectsService.deleteById` can leave
          // records whose joined `Session` or `Subject` document no longer exists.
          groupId: { $toString: { $ifNull: ['$groupId', null] } },
          id: {
            $toString: '$_id'
          },
          instrumentId: 1,
          seriesInstrumentId: { $ifNull: ['$seriesInstrumentId', null] },
          session: {
            date: {
              $ifNull: [
                {
                  $dateToString: {
                    date: '$session.date',
                    format: '%Y-%m-%d'
                  }
                },
                null
              ]
            },
            groupId: { $toString: { $ifNull: ['$session.groupId', null] } },
            id: {
              $toString: '$sessionId'
            },
            type: { $ifNull: ['$session.type', null] },
            user: {
              username: { $ifNull: ['$sessionUser.username', null] }
            }
          },
          subject: {
            age: {
              $ifNull: [
                {
                  $dateDiff: {
                    endDate: '$$NOW',
                    startDate: '$subject.dateOfBirth',
                    unit: 'year'
                  }
                },
                null
              ]
            },
            groupIds: {
              $map: {
                as: 'groupId',
                in: { $toString: '$$groupId' },
                input: { $ifNull: ['$subject.groupIds', []] }
              }
            },
            id: '$subjectId',
            sex: { $ifNull: ['$subject.sex', null] }
          }
        }
      }
    ];

    return (await this.instrumentRecordModel.aggregateRaw({ pipeline })) as unknown as RawExportRecord[];
  }

  /**
   * Map every readable series instrument referenced by these records to its title.
   *
   * A series instrument has no `internal.name`, so unlike the scalar instruments beside it in the
   * export there is no language-independent identifier to use — the title is translated here, to
   * `en`, because an export carries no request language. The stable identifier an analysis should
   * key on is the accompanying `seriesId`. Callers lacking `read Instrument` or referencing a
   * series owned by another group leave the entry omitted so `seriesName` falls back to `null`.
   */
  private async resolveSeriesNames(
    records: { seriesInstrumentId: null | string }[],
    { ability, callerGroupIds }: Required<Pick<EntityOperationOptions, 'ability'>> & { callerGroupIds?: string[] }
  ): Promise<{ [id: string]: string }> {
    const seriesIds = new Set(
      records.flatMap((record) => (record.seriesInstrumentId ? [record.seriesInstrumentId] : []))
    );
    if (seriesIds.size === 0 || !ability.can('read', 'Instrument')) {
      return {};
    }
    const seriesGroupIds = ability.can('manage', 'all') ? undefined : callerGroupIds;
    const entries = await Promise.all(
      seriesIds.values().map(async (id) => {
        try {
          const instrument = await this.instrumentsService.findById(id, { ability }, seriesGroupIds);
          return [[id, translateInstrument(instrument, 'en').details.title] as const];
        } catch (error) {
          if (error instanceof NotFoundException) {
            return [];
          }
          throw error;
        }
      })
    );
    return Object.fromEntries(entries.flat());
  }
}
