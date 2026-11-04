import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import { beforeEach, describe, expect, it } from 'vitest';

import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';

import { PermissionSetsService } from '../permission-sets.service';

const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);

const RULES: PermissionSetRule[] = [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }];

const STORED_SET = { _count: { users: 3 }, id: 'set-1', name: 'Research Assistant', rules: RULES };

describe('PermissionSetsService', () => {
  let permissionSetsService: PermissionSetsService;
  let permissionSetModel: MockedInstance<Model<'PermissionSet'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PermissionSetsService, MockFactory.createForModelToken(getModelToken('PermissionSet'))]
    }).compile();
    permissionSetModel = moduleRef.get(getModelToken('PermissionSet'));
    permissionSetsService = moduleRef.get(PermissionSetsService);
    permissionSetModel.exists.mockResolvedValue(false);
    permissionSetModel.findFirst.mockResolvedValue(STORED_SET);
  });

  describe('create', () => {
    it('should store the name and rules', async () => {
      await permissionSetsService.create({ name: 'Research Assistant', rules: RULES });
      expect(permissionSetModel.create.mock.lastCall?.[0]).toEqual({
        data: { name: 'Research Assistant', rules: RULES }
      });
    });

    it('should refuse a name another set already has, before writing anything', async () => {
      permissionSetModel.exists.mockResolvedValue(true);
      await expect(permissionSetsService.create({ name: 'Research Assistant', rules: RULES })).rejects.toThrow(
        ConflictException
      );
      expect(permissionSetModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return each set with the number of users holding it', async () => {
      permissionSetModel.findMany.mockResolvedValue([STORED_SET]);
      await expect(permissionSetsService.findAll({ ability })).resolves.toEqual([
        { holderCount: 3, id: 'set-1', name: 'Research Assistant', rules: RULES }
      ]);
    });

    it('should scope the listing to the caller ability', async () => {
      permissionSetModel.findMany.mockResolvedValue([]);
      await permissionSetsService.findAll({ ability });
      expect(permissionSetModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: accessibleQuery(ability, 'read', 'PermissionSet')
      });
    });
  });

  describe('findById', () => {
    it('should return the set with the number of users holding it, found within the caller read scope', async () => {
      await expect(permissionSetsService.findById('set-1', { ability })).resolves.toEqual({
        holderCount: 3,
        id: 'set-1',
        name: 'Research Assistant',
        rules: RULES
      });
      expect(permissionSetModel.findFirst.mock.lastCall?.[0]).toMatchObject({
        where: { AND: [accessibleQuery(ability, 'read', 'PermissionSet')], id: 'set-1' }
      });
    });

    it('should throw when the set cannot be found', async () => {
      permissionSetModel.findFirst.mockResolvedValue(null);
      await expect(permissionSetsService.findById('set-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateById', () => {
    it('should replace the rules wholesale, as a composite list must be on MongoDB', async () => {
      await permissionSetsService.updateById('set-1', { rules: RULES }, { ability });
      expect(permissionSetModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { rules: { set: RULES } },
        where: { AND: [accessibleQuery(ability, 'update', 'PermissionSet')], id: 'set-1' }
      });
    });

    it('should leave the rules alone when they are not being changed', async () => {
      await permissionSetsService.updateById('set-1', { name: 'Renamed' });
      expect(permissionSetModel.update.mock.lastCall?.[0].data).toEqual({ name: 'Renamed', rules: undefined });
    });

    it('should refuse a rename to a name another set already has', async () => {
      permissionSetModel.exists.mockResolvedValue(true);
      await expect(permissionSetsService.updateById('set-1', { name: 'Taken' })).rejects.toThrow(ConflictException);
      expect(permissionSetModel.update).not.toHaveBeenCalled();
    });

    it('should not look for a collision when the name is unchanged, since it would always find this set', async () => {
      await permissionSetsService.updateById('set-1', { name: 'Research Assistant' });
      expect(permissionSetModel.exists).not.toHaveBeenCalled();
      expect(permissionSetModel.update).toHaveBeenCalledOnce();
    });

    it('should throw when the set cannot be found, before writing anything', async () => {
      permissionSetModel.findFirst.mockResolvedValue(null);
      await expect(permissionSetsService.updateById('set-1', { name: 'Renamed' })).rejects.toThrow(NotFoundException);
      expect(permissionSetModel.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('should delete the set within the caller delete scope', async () => {
      await permissionSetsService.deleteById('set-1', { ability });
      expect(permissionSetModel.delete.mock.lastCall?.[0]).toEqual({
        where: { AND: [accessibleQuery(ability, 'delete', 'PermissionSet')], id: 'set-1' }
      });
    });

    it('should throw when the set cannot be found, rather than failing inside the delete', async () => {
      permissionSetModel.findFirst.mockResolvedValue(null);
      await expect(permissionSetsService.deleteById('set-1')).rejects.toThrow(NotFoundException);
      expect(permissionSetModel.delete).not.toHaveBeenCalled();
    });
  });
});
