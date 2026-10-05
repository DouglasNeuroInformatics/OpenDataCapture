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

  it('should create a session with the caller ability, so the group and user are looked up within it', async () => {
    const data = {
      date: new Date('2024-01-01T00:00:00.000Z'),
      groupId: 'group-1',
      subjectData: { id: 'subject-1' },
      type: 'IN_PERSON' as const
    };
    sessionsService.create.mockResolvedValue({ id: 'session-1' });

    await expect(sessionsController.create(data, ability)).resolves.toEqual({ id: 'session-1' });
    expect(sessionsService.create).toHaveBeenCalledWith(data, { ability });
  });

  it('should list the requested group sessions within what the caller may read', async () => {
    const sessions = [{ id: 'session-1' }];
    sessionsService.findAllIncludeUsernames.mockResolvedValue(sessions);

    await expect(sessionsController.findAllIncludeUsernames(ability, 'group-1')).resolves.toBe(sessions);
    expect(sessionsService.findAllIncludeUsernames).toHaveBeenCalledWith('group-1', { ability });
  });

  it('should find a session by id within what the caller may read', async () => {
    sessionsService.findById.mockResolvedValue({ id: 'session-1' });

    await expect(sessionsController.findByID('session-1', ability)).resolves.toEqual({ id: 'session-1' });
    expect(sessionsService.findById).toHaveBeenCalledWith('session-1', { ability });
  });
});
