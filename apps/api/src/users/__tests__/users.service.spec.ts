import { CryptoService, getModelToken } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Permissions } from '@opendatacapture/schemas/core';
import { pwnedPassword } from 'hibp';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';

import { GroupsService } from '../../groups/groups.service';
import { UsersService } from '../users.service';

vi.mock('hibp', () => ({ pwnedPassword: vi.fn() }));
vi.mock('@douglasneuroinformatics/libpasswd', () => ({ estimatePasswordStrength: vi.fn() }));

const baseUser = {
  basePermissionLevel: 'STANDARD' as const,
  firstName: 'Jane',
  groupIds: [],
  lastName: 'Doe',
  password: 'jf8&Kd0!mZq2wLx',
  username: 'jane.doe'
};

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: MockedInstance<Model<'User'>>;
  let cryptoService: MockedInstance<CryptoService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        MockFactory.createForModelToken(getModelToken('User')),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(GroupsService)
      ]
    }).compile();
    userModel = moduleRef.get(getModelToken('User'));
    usersService = moduleRef.get(UsersService);
    cryptoService = moduleRef.get(CryptoService);

    userModel.exists.mockResolvedValue(false);
    userModel.create.mockResolvedValue({});
    cryptoService.hashPassword.mockResolvedValue('hashed-password');
    // By default the password is strong and has not appeared in a breach.
    (estimatePasswordStrength as Mock).mockReturnValue({ feedback: {}, score: 4, success: true });
    (pwnedPassword as Mock).mockResolvedValue(0);
  });

  describe('create (password policy)', () => {
    it('creates the user when the password is strong, unique, and not breached', async () => {
      await usersService.create({ ...baseUser });
      expect(userModel.create).toHaveBeenCalledOnce();
      expect(cryptoService.hashPassword).toHaveBeenCalledWith(baseUser.password);
    });

    it('rejects a weak password with the INSUFFICIENT_PASSWORD_STRENGTH code', async () => {
      (estimatePasswordStrength as Mock).mockReturnValue({ feedback: {}, score: 1, success: false });
      await expect(usersService.create({ ...baseUser })).rejects.toMatchObject({
        response: { code: 'INSUFFICIENT_PASSWORD_STRENGTH' }
      });
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('rejects a password equal to the username (ignoring case) with the PASSWORD_MATCHES_USERNAME code', async () => {
      await expect(
        usersService.create({ ...baseUser, password: 'Jane.Doe', username: 'jane.doe' })
      ).rejects.toMatchObject({ response: { code: 'PASSWORD_MATCHES_USERNAME' } });
      // The username check should short-circuit before any network call.
      expect(pwnedPassword).not.toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('rejects a breached password with the PASSWORD_IN_DATA_BREACH code', async () => {
      (pwnedPassword as Mock).mockResolvedValue(42);
      await expect(usersService.create({ ...baseUser })).rejects.toMatchObject({
        response: { code: 'PASSWORD_IN_DATA_BREACH' }
      });
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('fails open and allows the password when the breach check is unreachable', async () => {
      (pwnedPassword as Mock).mockRejectedValue(new Error('network unreachable'));
      await usersService.create({ ...baseUser });
      expect(userModel.create).toHaveBeenCalledOnce();
    });

    it('should persist mustResetPassword, so a generated password forces a reset at first sign-in', async () => {
      await usersService.create({ ...baseUser, mustResetPassword: true });
      expect(userModel.create.mock.lastCall?.[0]).toMatchObject({ data: { mustResetPassword: true } });
    });
  });

  describe('updateById', () => {
    beforeEach(() => {
      userModel.findFirst.mockResolvedValue({
        additionalPermissions: [
          { action: 'read', groupId: 'group-1', subject: 'Subject' },
          { action: 'read', groupId: 'group-2', subject: 'Subject' },
          { action: 'create', groupId: null, subject: 'Instrument' }
        ],
        groupIds: ['group-1', 'group-2'],
        id: 'user-1',
        username: 'jane.doe'
      });
      userModel.update.mockResolvedValue({});
    });

    it('should drop the grants confined to a group the user is leaving, and keep every other one', async () => {
      await usersService.updateById('user-1', { groupIds: ['group-1'] });
      expect(userModel.update.mock.lastCall?.[0].data.additionalPermissions).toEqual([
        { action: 'read', groupId: 'group-1', subject: 'Subject' },
        { action: 'create', groupId: null, subject: 'Instrument' }
      ]);
    });

    it('should leave the grants alone when the groups are not being changed', async () => {
      await usersService.updateById('user-1', { firstName: 'Janet' });
      expect(userModel.update.mock.lastCall?.[0].data.additionalPermissions).toBeUndefined();
    });
  });

  describe('updatePermissions', () => {
    beforeEach(() => {
      userModel.findFirst.mockResolvedValue({ groupIds: ['group-1'], id: 'user-1' });
      userModel.update.mockResolvedValue({});
    });

    it('should write a grant confined to a group the user belongs to', async () => {
      const permissions: Permissions = [{ action: 'read', groupId: 'group-1', subject: 'Subject' }];
      await usersService.updatePermissions('user-1', permissions);
      expect(userModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { additionalPermissions: permissions },
        where: { id: 'user-1' }
      });
    });

    it('should reject a grant confined to a group the user does not belong to, before writing anything', async () => {
      const permissions: Permissions = [{ action: 'read', groupId: 'group-2', subject: 'Subject' }];
      await expect(usersService.updatePermissions('user-1', permissions)).rejects.toThrow(BadRequestException);
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it("should accept an unscoped grant whatever the user's groups", async () => {
      const permissions: Permissions = [{ action: 'create', groupId: null, subject: 'Instrument' }];
      await usersService.updatePermissions('user-1', permissions);
      expect(userModel.update.mock.lastCall?.[0]).toMatchObject({ data: { additionalPermissions: permissions } });
    });

    it('should throw when the user cannot be found, rather than creating one', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await expect(usersService.updatePermissions('user-1', [])).rejects.toThrow(NotFoundException);
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it('should scope the write to the caller ability', async () => {
      const ability = createAppAbility([
        { action: 'manage', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'User' }
      ]);
      await usersService.updatePermissions('user-1', [], { ability });
      expect(userModel.update.mock.lastCall?.[0]).toMatchObject({
        where: { AND: [accessibleQuery(ability, 'update', 'User')], id: 'user-1' }
      });
    });
  });

  describe('updateSelfById', () => {
    const currentUser = { id: 'user-1', username: 'jane.doe' } as any;

    beforeEach(() => {
      userModel.findFirst.mockResolvedValue({ hashedPassword: 'hashed-current', id: 'user-1' });
      userModel.update.mockResolvedValue({});
      cryptoService.comparePassword.mockResolvedValue(false);
    });

    it('should clear mustResetPassword when the user sets a password, which is what lifts the lock', async () => {
      await usersService.updateSelfById('user-1', { password: 'jf8&Kd0!mZq2wLx' }, currentUser);
      expect(userModel.update.mock.lastCall?.[0]).toMatchObject({ data: { mustResetPassword: false } });
    });

    it('should leave mustResetPassword untouched when no password is set, so editing a profile cannot lift it', async () => {
      await usersService.updateSelfById('user-1', { firstName: 'Janet' }, currentUser);
      expect(userModel.update.mock.lastCall?.[0].data.mustResetPassword).toBeUndefined();
    });

    it('should reject the password already on the account, so a forced reset cannot be satisfied by it', async () => {
      cryptoService.comparePassword.mockResolvedValue(true);
      await expect(
        usersService.updateSelfById('user-1', { password: 'jf8&Kd0!mZq2wLx' }, currentUser)
      ).rejects.toMatchObject({ response: { code: 'PASSWORD_MATCHES_CURRENT' } });
      expect(userModel.update).not.toHaveBeenCalled();
    });
  });
});
