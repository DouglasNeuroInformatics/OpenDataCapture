import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { StartSessionController } from '../start-session.controller';
import { StartSessionService } from '../start-session.service';

const ability = createAppAbility([{ action: 'manage', subject: 'Session' }]);

describe('StartSessionController', () => {
  let startSessionController: StartSessionController;
  let startSessionService: MockedInstance<StartSessionService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StartSessionController],
      providers: [MockFactory.createForService(StartSessionService)]
    }).compile();
    startSessionController = moduleRef.get(StartSessionController);
    startSessionService = moduleRef.get(StartSessionService);
  });

  it('should start a session with the caller ability, so the group and user are looked up within it', async () => {
    const data = {
      date: new Date('2024-01-01T00:00:00.000Z'),
      groupId: 'group-1',
      subjectData: { id: 'subject-1' },
      type: 'IN_PERSON' as const
    };
    startSessionService.start.mockResolvedValue({ id: 'session-1' });

    await expect(startSessionController.create(data, ability)).resolves.toEqual({ id: 'session-1' });
    expect(startSessionService.start).toHaveBeenCalledWith(data, ability);
  });
});
