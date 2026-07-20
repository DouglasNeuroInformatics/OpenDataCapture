import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '../instruments.service';

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Instrument')),
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(VirtualizationService)
      ]
    }).compile();
    instrumentsService = moduleRef.get(InstrumentsService);
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
    expect(instrumentModel).toBeDefined();
  });

  describe('findInfo', () => {
    beforeEach(() => {
      const instances = [
        { details: { title: 'Happiness Questionnaire' }, id: 'id-1', internal: { edition: 1, name: 'HQ' } },
        { details: { title: 'Happiness Questionnaire' }, id: 'id-2', internal: { edition: 2, name: 'HQ' } }
      ] as Awaited<ReturnType<InstrumentsService['find']>>;
      vi.spyOn(instrumentsService, 'find').mockResolvedValue(instances);
      instrumentModel.findMany.mockResolvedValue([]);
    });

    it('should return only the latest edition of each instrument by default', async () => {
      const result = await instrumentsService.findInfo();
      expect(result.map((info) => info.id)).toEqual(['id-2']);
    });

    it('should return every edition when allEditions is set', async () => {
      const result = await instrumentsService.findInfo({ allEditions: true });
      expect(result.map((info) => info.id)).toEqual(['id-1', 'id-2']);
    });
  });

  describe('find', () => {
    beforeEach(() => {
      instrumentModel.findMany.mockResolvedValue([]);
      instrumentRecordModel.findMany.mockResolvedValue([]);
      vi.spyOn(instrumentsService as any, 'instantiate').mockResolvedValue([]);
    });

    it('should not query instruments at all when no subject is given', async () => {
      await instrumentsService.find();
      expect(instrumentRecordModel.findMany).not.toHaveBeenCalled();
    });

    // A `records: { some: ... }` relation filter compiles to a $lookup that materialises every
    // record belonging to an instrument, which mongodb aborts past 100 MiB. The subject's own
    // records are queried instead, so the work is bounded by the subject rather than the instrument.
    it('should resolve the subject filter against records rather than joining from instruments', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([{ instrumentId: 'id-1' }, { instrumentId: 'id-2' }] as any);

      await instrumentsService.find({ subjectId: 'subject-1' });

      expect(instrumentRecordModel.findMany).toHaveBeenCalledWith({
        distinct: ['instrumentId'],
        select: { instrumentId: true },
        where: { subjectId: 'subject-1' }
      });
      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { AND: expect.arrayContaining([{ id: { in: ['id-1', 'id-2'] } }]) }
      });
      expect(JSON.stringify(instrumentModel.findMany.mock.lastCall?.[0])).not.toContain('records');
    });

    it('should return nothing when the subject has no records', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([]);

      await instrumentsService.find({ subjectId: 'subject-with-no-records' });

      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { AND: expect.arrayContaining([{ id: { in: [] } }]) }
      });
    });
  });
});
