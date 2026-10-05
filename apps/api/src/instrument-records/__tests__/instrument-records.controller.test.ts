import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { InstrumentRecordsController } from '../instrument-records.controller';
import { InstrumentRecordsService } from '../instrument-records.service';

const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);

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

  it('should pass every query filter to find, scoped to the caller ability', async () => {
    const minDate = new Date('2025-01-01');
    await instrumentRecordsController.find(ability, 'FORM', minDate, 'group-1', 'instrument-1', 'subject-1');
    expect(instrumentRecordsService.find).toHaveBeenCalledWith(
      { groupId: 'group-1', instrumentId: 'instrument-1', kind: 'FORM', minDate, subjectId: 'subject-1' },
      { ability }
    );
  });

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

  it('should update the record with the unwrapped data, scoped to the caller ability', async () => {
    await instrumentRecordsController.updateById('record-1', { data: { score: 2 } }, ability);
    expect(instrumentRecordsService.updateById).toHaveBeenCalledWith('record-1', { score: 2 }, { ability });
  });

  it('should find the record scoped to the caller ability', async () => {
    await instrumentRecordsController.findById('record-1', ability);
    expect(instrumentRecordsService.findById).toHaveBeenCalledWith('record-1', { ability });
  });
});
