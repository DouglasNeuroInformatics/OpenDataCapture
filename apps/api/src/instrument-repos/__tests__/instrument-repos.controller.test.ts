import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';
import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator';

import { InstrumentReposController } from '../instrument-repos.controller';
import { InstrumentReposService } from '../instrument-repos.service';

const ability = createAppAbility([{ action: 'manage', subject: 'InstrumentRepo' }]);
const repo = { id: 'repo-1', name: 'repo' };

describe('InstrumentReposController', () => {
  let controller: InstrumentReposController;
  let service: MockedInstance<InstrumentReposService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentReposController],
      providers: [MockFactory.createForService(InstrumentReposService)]
    }).compile();
    controller = moduleRef.get(InstrumentReposController);
    service = moduleRef.get(InstrumentReposService);
  });

  it('should pass the submitted repository to the service when creating one', async () => {
    const data = { accessToken: 'token', url: 'https://github.com/owner/repo' };
    service.create.mockResolvedValueOnce(repo);
    await expect(controller.create(data)).resolves.toBe(repo);
    expect(service.create).toHaveBeenCalledWith(data);
  });

  it("should scope the deletion to the current user's ability", async () => {
    service.deleteById.mockResolvedValueOnce(repo);
    await expect(controller.deleteById('repo-1', ability)).resolves.toBe(repo);
    expect(service.deleteById).toHaveBeenCalledWith('repo-1', { ability });
  });

  it("should scope the listing to the current user's ability", async () => {
    service.findAll.mockResolvedValueOnce([repo]);
    await expect(controller.findAll(ability)).resolves.toStrictEqual([repo]);
    expect(service.findAll).toHaveBeenCalledWith({ ability });
  });

  it('should sync the requested repository', async () => {
    service.sync.mockResolvedValueOnce(repo);
    await expect(controller.sync('repo-1')).resolves.toBe(repo);
    expect(service.sync).toHaveBeenCalledWith('repo-1');
  });

  it.each([
    ['create', 'create'],
    ['deleteById', 'delete'],
    ['findAll', 'read'],
    ['sync', 'update']
  ] as const)('should gate %s on the %s InstrumentRepo permission', (handler, action) => {
    const reflector = new Reflector();
    expect(reflector.get(ROUTE_ACCESS_METADATA_KEY, InstrumentReposController.prototype[handler])).toStrictEqual({
      action,
      subject: 'InstrumentRepo'
    });
  });
});
