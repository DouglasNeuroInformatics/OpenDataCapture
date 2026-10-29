import type { ParseSchemaPipe } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { InstrumentRecordsController } from '../instrument-records.controller';
import { InstrumentRecordsService } from '../instrument-records.service';

const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);

/** The pipe the `find` handler applies to its `minDate` query parameter. */
function getMinDatePipe(): ParseSchemaPipe<Date> {
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, InstrumentRecordsController, 'find') as {
    [key: string]: { data?: string; pipes: ParseSchemaPipe<Date>[] };
  };
  return Object.values(args).find(({ data }) => data === 'minDate')!.pipes[0]!;
}

describe('InstrumentRecordsController', () => {
  let instrumentRecordsController: InstrumentRecordsController;
  let instrumentRecordsService: MockedInstance<InstrumentRecordsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentRecordsController],
      providers: [MockFactory.createForService(InstrumentRecordsService)]
    }).compile();
    instrumentRecordsController = moduleRef.get(InstrumentRecordsController);
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
  });

  it('should create the record scoped to the caller ability', async () => {
    const data = {
      data: { score: 1 },
      date: new Date(),
      groupId: 'group-1',
      instrumentId: 'instrument-1',
      sessionId: 'session-1',
      subjectId: 'subject-1'
    };
    await instrumentRecordsController.create(data, ability);
    expect(instrumentRecordsService.create).toHaveBeenCalledWith(data, { ability });
  });

  it('should upload the records scoped to the caller ability', async () => {
    const data = { groupId: 'group-1', instrumentId: 'instrument-1', records: [] };
    await instrumentRecordsController.upload(data, ability);
    expect(instrumentRecordsService.upload).toHaveBeenCalledWith(data, { ability });
  });

  // The caller's groups are forwarded alongside the ability because a series lookup cannot be
  // confined by `read Instrument`, which carries no group condition.
  it('should pass every query filter to find, scoped to the caller ability and their groups', async () => {
    const minDate = new Date('2025-01-01');
    await instrumentRecordsController.find(
      ability,
      [{ id: 'group-1' }, { id: 'group-2' }],
      'FORM',
      minDate,
      'group-1',
      'instrument-1',
      'series-1',
      'subject-1'
    );
    expect(instrumentRecordsService.find).toHaveBeenCalledWith(
      {
        groupId: 'group-1',
        instrumentId: 'instrument-1',
        kind: 'FORM',
        minDate,
        seriesInstrumentId: 'series-1',
        subjectId: 'subject-1'
      },
      { ability, callerGroupIds: ['group-1', 'group-2'] }
    );
  });

  it('should read minDate from the ISO 8601 date-time the client serializes', async () => {
    await expect(getMinDatePipe().transform('2025-01-01T00:00:00.000Z')).resolves.toEqual(
      new Date('2025-01-01T00:00:00.000Z')
    );
  });

  it('should leave minDate undefined when the query omits it, so no records are excluded', async () => {
    await expect(getMinDatePipe().transform(undefined)).resolves.toBeUndefined();
  });

  it.each(['', '2025-01-01', 'yesterday'])(
    'should reject %j as minDate, rather than filter on some other moment',
    async (minDate) => {
      await expect(getMinDatePipe().transform(minDate)).rejects.toBeInstanceOf(BadRequestException);
    }
  );

  it('should delete the record scoped to the caller ability and return no content', async () => {
    instrumentRecordsService.deleteById.mockResolvedValueOnce(undefined);
    await expect(instrumentRecordsController.deleteById('record-1', ability)).resolves.toBeUndefined();
    expect(instrumentRecordsService.deleteById).toHaveBeenCalledWith('record-1', { ability });
  });

  it('should export the records of the requested group, scoped to the caller ability', async () => {
    await instrumentRecordsController.exportRecords(ability, 'group-1');
    expect(instrumentRecordsService.exportRecords).toHaveBeenCalledWith({ groupId: 'group-1' }, { ability });
  });

  it('should return the linear model computed for the instrument and group', async () => {
    const model = { score: { intercept: 1, slope: 2, stdErr: 0.5 } };
    instrumentRecordsService.linearModel.mockResolvedValueOnce(model);
    await expect(instrumentRecordsController.linearModel(ability, 'instrument-1', 'group-1')).resolves.toBe(model);
    expect(instrumentRecordsService.linearModel).toHaveBeenCalledWith(
      { groupId: 'group-1', instrumentId: 'instrument-1' },
      { ability }
    );
  });

  it('should summarize the records of the requested group, scoped to the caller ability', async () => {
    const summary = [{ lastCollectedAt: new Date('2025-01-01'), recordCount: 2, subjectId: 'subject-1' }];
    instrumentRecordsService.summarizeBySubject.mockResolvedValueOnce(summary);
    await expect(instrumentRecordsController.summarizeBySubject(ability, 'group-1')).resolves.toBe(summary);
    expect(instrumentRecordsService.summarizeBySubject).toHaveBeenCalledWith({ groupId: 'group-1' }, { ability });
  });

  it('should summarize the records per instrument, scoped to the caller ability', async () => {
    const summary = [{ instrumentId: 'instrument-1', lastCollectedAt: null, recordCount: 2, subjectCount: 1 }];
    instrumentRecordsService.summarizeByInstrument.mockResolvedValueOnce(summary);
    await expect(instrumentRecordsController.summarizeByInstrument(ability, 'group-1')).resolves.toBe(summary);
    expect(instrumentRecordsService.summarizeByInstrument).toHaveBeenCalledWith({ groupId: 'group-1' }, { ability });
  });

  // A series owns no records under its own id, so its totals come from a separate aggregation.
  it('should summarize the records per series, scoped to the caller ability', async () => {
    const summary = [{ instrumentId: 'series-1', lastCollectedAt: null, recordCount: 4, subjectCount: 2 }];
    instrumentRecordsService.summarizeBySeries.mockResolvedValueOnce(summary);
    await expect(instrumentRecordsController.summarizeBySeries(ability, 'group-1')).resolves.toBe(summary);
    expect(instrumentRecordsService.summarizeBySeries).toHaveBeenCalledWith({ groupId: 'group-1' }, { ability });
  });

  it('should update the record with the unwrapped data, scoped to the caller ability', async () => {
    await instrumentRecordsController.updateById('record-1', { data: { score: 2 } }, ability);
    expect(instrumentRecordsService.updateById).toHaveBeenCalledWith('record-1', { score: 2 }, { ability });
  });

  it('should find the record scoped to the caller ability', async () => {
    await instrumentRecordsController.findById('record-1', ability);
    expect(instrumentRecordsService.findById).toHaveBeenCalledWith('record-1', { ability });
  });
});
