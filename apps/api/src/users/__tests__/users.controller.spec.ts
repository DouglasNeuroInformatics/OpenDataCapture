import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AppAbility } from '@/auth/auth.types';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

const ability = {} as AppAbility;

const createUserData = {
  basePermissionLevel: 'STANDARD' as const,
  email: 'jane@example.org',
  firstName: 'Jane',
  groupIds: ['group-1', 'group-2'],
  lastName: 'Doe',
  password: 'Password123',
  username: 'jane.doe'
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: MockedInstance<UsersService>;
  let groupsService: MockedInstance<GroupsService>;
  let mailService: MockedInstance<MailService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        MockFactory.createForService(UsersService),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(MailService)
      ]
    }).compile();
    usersController = moduleRef.get(UsersController);
    usersService = moduleRef.get(UsersService);
    groupsService = moduleRef.get(GroupsService);
    mailService = moduleRef.get(MailService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      usersService.create.mockResolvedValue({ id: 'user-1', username: createUserData.username });
      groupsService.findById.mockImplementation((id: string) => Promise.resolve({ id, name: `Name of ${id}` }));
      mailService.sendNewUserEmail.mockResolvedValue({
        message: 'rendered',
        recipient: createUserData.email,
        status: 'SENT'
      });
    });

    it('returns the created user together with the welcome email result', async () => {
      await expect(usersController.create(createUserData, ability)).resolves.toMatchObject({
        id: 'user-1',
        welcomeEmail: { status: 'SENT' }
      });
    });

    it('sends the welcome email with the login url derived from the request origin', async () => {
      await usersController.create(createUserData, ability, 'https://odc.example.org');
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).toMatchObject({
        email: createUserData.email,
        url: 'https://odc.example.org/auth/login',
        username: createUserData.username
      });
    });

    it('never hands the password to the welcome email', async () => {
      await usersController.create(createUserData, ability, 'https://odc.example.org');
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).not.toHaveProperty('password');
    });

    it('sends an empty url when the origin header is absent', async () => {
      await usersController.create(createUserData, ability);
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).toMatchObject({ url: '' });
    });

    it('passes the requested language through', async () => {
      await usersController.create(createUserData, ability, undefined, 'fr');
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).toMatchObject({ language: 'fr' });
    });

    it('joins the names of the resolved groups', async () => {
      await usersController.create(createUserData, ability);
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).toMatchObject({
        group: 'Name of group-1, Name of group-2'
      });
    });

    it('omits groups the creator cannot read', async () => {
      groupsService.findById.mockImplementation((id: string) =>
        id === 'group-1' ? Promise.reject(new NotFoundException()) : Promise.resolve({ id, name: `Name of ${id}` })
      );
      await usersController.create(createUserData, ability);
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).toMatchObject({ group: 'Name of group-2' });
    });

    it('propagates a group lookup failure that is not a permission denial', async () => {
      groupsService.findById.mockRejectedValue(new Error('connection lost'));
      await expect(usersController.create(createUserData, ability)).rejects.toThrow('connection lost');
      expect(mailService.sendNewUserEmail).not.toHaveBeenCalled();
    });

    it('passes an empty group name when the user has no groups', async () => {
      await usersController.create({ ...createUserData, groupIds: [] }, ability);
      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(mailService.sendNewUserEmail.mock.lastCall?.[0]).toMatchObject({ group: '' });
    });
  });
});
