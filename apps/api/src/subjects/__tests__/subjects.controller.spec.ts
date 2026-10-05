import type { ParseSchemaPipe } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { SubjectsController } from '../subjects.controller';
import { SubjectsService } from '../subjects.service';

const ability = createAppAbility([{ action: 'manage', subject: 'Subject' }]);

/** The pipe the `deleteById` handler applies to its `:id` route parameter. */
function getDeleteIdPipe(): ParseSchemaPipe<string> {
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, SubjectsController, 'deleteById') as {
    [key: string]: { data?: string; pipes: ParseSchemaPipe<string>[] };
  };
  return Object.values(args).find(({ data }) => data === 'id')!.pipes[0]!;
}

describe('SubjectsController', () => {
  let subjectsController: SubjectsController;
  let subjectsService: MockedInstance<SubjectsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [MockFactory.createForService(SubjectsService)]
    }).compile();
    subjectsController = moduleRef.get(SubjectsController);
    subjectsService = moduleRef.get(SubjectsService);
  });

  it('should create the submitted subject', async () => {
    subjectsService.create.mockResolvedValue({ id: 'subject-1' });

    await expect(subjectsController.create({ id: 'subject-1' })).resolves.toEqual({ id: 'subject-1' });
    expect(subjectsService.create).toHaveBeenCalledWith({ id: 'subject-1' });
  });

  it('should delete a subject within what the caller may delete, forcing when asked', async () => {
    subjectsService.deleteById.mockResolvedValue({ id: 'subject-1' });

    await expect(subjectsController.deleteById('subject-1', true, ability)).resolves.toEqual({ id: 'subject-1' });
    expect(subjectsService.deleteById).toHaveBeenCalledWith('subject-1', { ability, force: true });
  });

  it('should leave force unset when the query omits it, so a subject with records is not deleted by default', async () => {
    await subjectsController.deleteById('subject-1', undefined, ability);

    expect(subjectsService.deleteById).toHaveBeenCalledWith('subject-1', { ability, force: undefined });
  });

  it('should list the subjects of the requested group within what the caller may read', async () => {
    const subjects = [{ id: 'subject-1' }];
    subjectsService.find.mockResolvedValue(subjects);

    await expect(subjectsController.find(ability, 'group-1', true)).resolves.toBe(subjects);
    expect(subjectsService.find).toHaveBeenCalledWith({ groupId: 'group-1', hasRecord: true }, { ability });
  });

  it('should find a subject by id within what the caller may read', async () => {
    subjectsService.findById.mockResolvedValue({ id: 'subject-1' });

    await expect(subjectsController.findById('subject-1', ability)).resolves.toEqual({ id: 'subject-1' });
    expect(subjectsService.findById).toHaveBeenCalledWith('subject-1', { ability });
  });

  it('should list the custom ids of a group within what the caller may read', async () => {
    subjectsService.findCustomIds.mockResolvedValue(['custom-1']);

    await expect(subjectsController.findCustomIds('group-1', ability)).resolves.toEqual(['custom-1']);
    expect(subjectsService.findCustomIds).toHaveBeenCalledWith('group-1', { ability });
  });

  it('should list the custom ids scoped to the default group within what the caller may read', async () => {
    subjectsService.findDefaultGroupCustomIds.mockResolvedValue(['custom-1']);

    await expect(subjectsController.findDefaultGroupCustomIds(ability)).resolves.toEqual(['custom-1']);
    expect(subjectsService.findDefaultGroupCustomIds).toHaveBeenCalledWith({ ability });
  });

  // Subject ids are hashes of demographic data or custom ids that may contain reserved characters, so
  // clients encode them into the path.
  it('should decode a percent-encoded subject id before deleting it', async () => {
    await expect(getDeleteIdPipe().transform('custom%2Fid%201')).resolves.toBe('custom/id 1');
  });
});
