import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { SessionsController } from '../sessions.controller';
import { SessionsService } from '../sessions.service';

const ability = createAppAbility([{ action: 'manage', subject: 'Session' }]);

describe('SessionsController', () => {
  let sessionsController: SessionsController;
  let sessionsService: MockedInstance<SessionsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [MockFactory.createForService(SessionsService)]
    }).compile();
    sessionsController = moduleRef.get(SessionsController);
    sessionsService = moduleRef.get(SessionsService);
  });

  it('should list the requested group sessions within what the caller may read', async () => {
    const sessions = [{ id: 'session-1' }];
    sessionsService.findAllIncludeUsernames.mockResolvedValue(sessions);

    await expect(sessionsController.findAllIncludeUsernames(ability, 'group-1')).resolves.toBe(sessions);
    expect(sessionsService.findAllIncludeUsernames).toHaveBeenCalledWith('group-1', { ability });
  });
});
