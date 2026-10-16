import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { SummaryController } from '../summary.controller';
import { SummaryService } from '../summary.service';

describe('SummaryController', () => {
  let summaryController: SummaryController;
  let summaryService: MockedInstance<SummaryService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [MockFactory.createForService(SummaryService)]
    }).compile();
    summaryController = moduleRef.get(SummaryController);
    summaryService = moduleRef.get(SummaryService);
  });

  it('should summarize the requested group within what the caller may read', async () => {
    const ability = createAppAbility([{ action: 'read', subject: 'all' }]);
    const summary = { counts: { instruments: 1, records: 2, sessions: 3, subjects: 4, users: 5 } };
    summaryService.getSummary.mockResolvedValue(summary);

    await expect(summaryController.getSummary(ability, 'group-1')).resolves.toBe(summary);
    expect(summaryService.getSummary).toHaveBeenCalledWith('group-1', { ability });
  });
});
