import { CryptoService, getModelToken } from '@douglasneuroinformatics/libnest';
import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Permissions } from '@opendatacapture/schemas/core';
import { pwnedPassword } from 'hibp';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';

import { GroupsService } from '../../groups/groups.service';
import { UsersService } from '../users.service';

vi.mock('hibp', () => ({ pwnedPassword: vi.fn() }));
vi.mock('@douglasneuroinformatics/libpasswd', () => ({ estimatePasswordStrength: vi.fn() }));

const admin = {
  ability: createAppAbility([{ action: 'manage', subject: 'all' }]),
  id: 'admin-1'
} as RequestUser;

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
  let groupsService: MockedInstance<GroupsService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        MockFactory.createForModelToken(getModelToken('User')),
        MockFactory.createForService(AuditLogger),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(GroupsService)
      ]
    }).compile();
    userModel = moduleRef.get(getModelToken('User'));
    usersService = moduleRef.get(UsersService);
    cryptoService = moduleRef.get(CryptoService);
    groupsService = moduleRef.get(GroupsService);

    userModel.exists.mockResolvedValue(false);
    userModel.create.mockResolvedValue({});
    cryptoService.hashPassword.mockResolvedValue('hashed-password');
    // By default the password is strong and has not appeared in a breach.
    (estimatePasswordStrength as Mock).mockReturnValue({ feedback: {}, score: 4, success: true });
    (pwnedPassword as Mock).mockResolvedValue(0);
  });

  describe('checkUsernameExists', () => {
    it('should report success when an accessible user has the username', async () => {
      userModel.findFirst.mockResolvedValue({ id: 'user-1', username: 'jane.doe' });
      await expect(usersService.checkUsernameExists('jane.doe')).resolves.toEqual({ success: true });
    });

    it('should report failure when no accessible user has the username', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await expect(usersService.checkUsernameExists('jane.doe')).resolves.toEqual({ success: false });
    });

    it('should scope the lookup to the caller ability, so it cannot probe users outside their groups', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await usersService.checkUsernameExists('jane.doe', { ability: admin.ability });
      expect(userModel.findFirst.mock.lastCall?.[0].where).toEqual({
        AND: [accessibleQuery(admin.ability, 'read', 'User'), { username: 'jane.doe' }]
      });
    });
  });

  describe('count', () => {
    it('should count only the users matching the filter that the caller can read', async () => {
      userModel.count.mockResolvedValue(3);
      await expect(usersService.count({ disabled: false }, { ability: admin.ability })).resolves.toBe(3);
      expect(userModel.count).toHaveBeenCalledWith({
        where: { AND: [accessibleQuery(admin.ability, 'read', 'User'), { disabled: false }] }
      });
    });

    it('should count every user when called without a filter or ability', async () => {
      userModel.count.mockResolvedValue(5);
      await expect(usersService.count()).resolves.toBe(5);
      expect(userModel.count).toHaveBeenCalledWith({ where: { AND: [{}, {}] } });
    });
  });

  describe('create', () => {
    it('should refuse a username that is already taken, before hashing anything', async () => {
      userModel.exists.mockResolvedValue(true);
      await expect(usersService.create({ ...baseUser })).rejects.toThrow(ConflictException);
      expect(cryptoService.hashPassword).not.toHaveBeenCalled();
    });

    it('should propagate a group lookup that finds nothing, so the user is never connected to it', async () => {
      groupsService.findById.mockRejectedValue(new NotFoundException());
      await expect(usersService.create({ ...baseUser, groupIds: ['group-1'] })).rejects.toThrow(NotFoundException);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('should look up every group with the caller options, so no group outside their scope can be joined', async () => {
      groupsService.findById.mockImplementation((id: string) => Promise.resolve({ id }));
      await usersService.create({ ...baseUser, groupIds: ['group-1', 'group-2'] }, { ability: admin.ability });
      expect(groupsService.findById).toHaveBeenCalledTimes(2);
      expect(groupsService.findById).toHaveBeenCalledWith('group-1', { ability: admin.ability });
      expect(groupsService.findById).toHaveBeenCalledWith('group-2', { ability: admin.ability });
    });

    it('should connect the user to every requested group, so membership matches the request', async () => {
      groupsService.findById.mockImplementation((id: string) => Promise.resolve({ id }));
      await usersService.create({ ...baseUser, groupIds: ['group-1', 'group-2'] });
      expect(userModel.create.mock.lastCall?.[0].data.groups).toEqual({
        connect: [{ id: 'group-1' }, { id: 'group-2' }]
      });
    });

    it('should store the hashed password rather than the plaintext one', async () => {
      await usersService.create({ ...baseUser });
      expect(userModel.create.mock.lastCall?.[0].data).toMatchObject({ hashedPassword: 'hashed-password' });
      expect(userModel.create.mock.lastCall?.[0].data).not.toHaveProperty('password');
    });

    it('should omit the hashed password from the created user, so it never reaches the response', async () => {
      await usersService.create({ ...baseUser });
      expect(userModel.create.mock.lastCall?.[0].omit).toEqual({ hashedPassword: true });
    });

    it('should start the user with no additional permissions, so access comes only from their base level', async () => {
      await usersService.create({ ...baseUser });
      expect(userModel.create.mock.lastCall?.[0].data.additionalPermissions).toEqual([]);
    });
  });

  describe('deleteByUsername', () => {
    it("should delete the found user's record within the caller's delete scope", async () => {
      userModel.findFirst.mockResolvedValue({ id: 'user-1', username: 'jane.doe' });
      userModel.delete.mockResolvedValue({ id: 'user-1' });
      await expect(usersService.deleteByUsername('jane.doe', { ability: admin.ability })).resolves.toEqual({
        id: 'user-1'
      });
      expect(userModel.delete.mock.lastCall?.[0].where).toEqual({
        AND: [accessibleQuery(admin.ability, 'delete', 'User')],
        id: 'user-1'
      });
    });

    it('should throw when no user has the username, rather than deleting anything', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await expect(usersService.deleteByUsername('jane.doe')).rejects.toThrow(NotFoundException);
      expect(userModel.delete).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    beforeEach(() => {
      userModel.findMany.mockResolvedValue([{ id: 'user-1' }]);
    });

    it('should restrict the listing to members of the requested group', async () => {
      await expect(usersService.find({ groupId: 'group-1' }, { ability: admin.ability })).resolves.toEqual([
        { id: 'user-1' }
      ]);
      expect(userModel.findMany.mock.lastCall?.[0].where).toEqual({
        AND: [accessibleQuery(admin.ability, 'read', 'User'), { groupIds: { has: 'group-1' } }]
      });
    });

    it('should apply no group filter when none is requested', async () => {
      await usersService.find();
      expect(userModel.findMany.mock.lastCall?.[0].where).toEqual({ AND: [{}, { groupIds: undefined }] });
    });
  });

  describe('findById', () => {
    it('should return the user found within the caller read scope', async () => {
      userModel.findFirst.mockResolvedValue({ id: 'user-1' });
      await expect(usersService.findById('user-1', { ability: admin.ability })).resolves.toEqual({ id: 'user-1' });
      expect(userModel.findFirst.mock.lastCall?.[0]).toMatchObject({
        omit: { hashedPassword: true },
        where: { AND: [accessibleQuery(admin.ability, 'read', 'User')], id: 'user-1' }
      });
    });

    it('should throw when the user cannot be found', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await expect(usersService.findById('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should omit the hashed password by default, so it never leaks into a response', async () => {
      userModel.findFirst.mockResolvedValue({ id: 'user-1' });
      await usersService.findByUsername('jane.doe');
      expect(userModel.findFirst.mock.lastCall?.[0].omit).toEqual({ hashedPassword: true });
    });

    it('should include the hashed password when asked, so login can verify it', async () => {
      userModel.findFirst.mockResolvedValue({ hashedPassword: 'hashed', id: 'user-1' });
      await usersService.findByUsername('jane.doe', { includeHashedPassword: true });
      expect(userModel.findFirst.mock.lastCall?.[0].omit).toEqual({ hashedPassword: false });
    });

    it('should throw when no accessible user has the username', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await expect(usersService.findByUsername('jane.doe')).rejects.toThrow(NotFoundException);
    });
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
      await usersService.updateById('user-1', { groupIds: ['group-1'] }, admin);
      expect(userModel.update.mock.lastCall?.[0].data.additionalPermissions).toEqual([
        { action: 'read', groupId: 'group-1', subject: 'Subject' },
        { action: 'create', groupId: null, subject: 'Instrument' }
      ]);
    });

    it('should leave the grants alone when the groups are not being changed', async () => {
      await usersService.updateById('user-1', { firstName: 'Janet' }, admin);
      expect(userModel.update.mock.lastCall?.[0].data.additionalPermissions).toBeUndefined();
    });

    it('should refuse an administrator disabling their own account, so the last one cannot lock every admin out', async () => {
      await expect(usersService.updateById(admin.id, { disabled: true }, admin)).rejects.toThrow(ForbiddenException);
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it.each(['GROUP_MANAGER', 'STANDARD', null] as const)(
      'should refuse an administrator setting their own level to %s, so the last one cannot lock every admin out',
      async (basePermissionLevel) => {
        await expect(usersService.updateById(admin.id, { basePermissionLevel }, admin)).rejects.toThrow(
          ForbiddenException
        );
        expect(userModel.update).not.toHaveBeenCalled();
      }
    );

    it('should save an administrator editing their own account, since the admin form sends `disabled: false` on every save', async () => {
      await usersService.updateById(admin.id, { disabled: false, firstName: 'Janet' }, admin);
      expect(userModel.update).toHaveBeenCalledOnce();
    });

    it('should hash a new password and never write the plaintext one', async () => {
      await usersService.updateById('user-1', { password: 'jf8&Kd0!mZq2wLx' }, admin);
      expect(cryptoService.hashPassword).toHaveBeenCalledWith('jf8&Kd0!mZq2wLx');
      expect(userModel.update.mock.lastCall?.[0].data).toMatchObject({ hashedPassword: 'hashed-password' });
      expect(userModel.update.mock.lastCall?.[0].data).not.toHaveProperty('password');
    });

    it('should check a new password against the stored username when the username is not being changed', async () => {
      await expect(usersService.updateById('user-1', { password: 'Jane.Doe' }, admin)).rejects.toMatchObject({
        response: { code: 'PASSWORD_MATCHES_USERNAME' }
      });
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it('should check a new password against the incoming username when the username is being changed', async () => {
      await expect(
        usersService.updateById('user-1', { password: 'New.Name', username: 'new.name' }, admin)
      ).rejects.toMatchObject({ response: { code: 'PASSWORD_MATCHES_USERNAME' } });
      expect(userModel.findFirst).not.toHaveBeenCalled();
    });

    it('should let an administrator disable and demote another user', async () => {
      await usersService.updateById('user-1', { basePermissionLevel: 'STANDARD', disabled: true }, admin);
      expect(userModel.update.mock.lastCall?.[0].data).toMatchObject({
        basePermissionLevel: 'STANDARD',
        disabled: true
      });
    });
  });

  describe('archiveById', () => {
    beforeEach(() => {
      userModel.update.mockResolvedValue({});
    });

    it('should refuse an administrator archiving their own account, so the last one cannot remove every admin', async () => {
      await expect(usersService.archiveById(admin.id, admin)).rejects.toThrow(ForbiddenException);
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it('should set archivedAt instead of deleting the record', async () => {
      await usersService.archiveById('user-1', admin);
      expect(userModel.update.mock.lastCall?.[0].data.archivedAt).toBeInstanceOf(Date);
      expect(userModel.update.mock.lastCall?.[0].where).toMatchObject({ id: 'user-1' });
    });
  });

  describe('unarchiveById', () => {
    beforeEach(() => {
      userModel.update.mockResolvedValue({});
    });

    it('should refuse an administrator unarchiving their own account', async () => {
      await expect(usersService.unarchiveById(admin.id, admin)).rejects.toThrow(ForbiddenException);
    });

    it('should clear archivedAt to restore the account', async () => {
      await usersService.unarchiveById('user-1', admin);
      expect(userModel.update.mock.lastCall?.[0].data).toMatchObject({ archivedAt: null });
      expect(userModel.update.mock.lastCall?.[0].where).toMatchObject({ id: 'user-1' });
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

    it("should refuse to update another user's account through the self-update route", async () => {
      await expect(usersService.updateSelfById('user-2', { firstName: 'Janet' }, currentUser)).rejects.toThrow(
        ForbiddenException
      );
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it('should throw when the account disappears before its current password can be compared', async () => {
      userModel.findFirst.mockResolvedValue(null);
      await expect(usersService.updateSelfById('user-1', { password: 'jf8&Kd0!mZq2wLx' }, currentUser)).rejects.toThrow(
        NotFoundException
      );
      expect(userModel.update).not.toHaveBeenCalled();
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
