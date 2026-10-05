import { LoggingService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Group } from '@opendatacapture/schemas/group';
import type { BasePermissionLevel } from '@opendatacapture/schemas/user';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { createAppAbility } from '@/auth/ability.utils';
import { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY } from '@/core/decorators/accepts-instrument-token.decorator';
import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator';
import type { ProtectedRoutePermissionSet } from '@/core/decorators/route-access.decorator';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

const currentUser: RequestUser = {
  ability: createAppAbility([{ action: 'manage', subject: 'Instrument' }]),
  basePermissionLevel: 'GROUP_MANAGER',
  firstName: 'Test',
  groups: [],
  id: 'user-1',
  kind: 'login',
  lastName: 'User',
  mustResetPassword: false,
  permissions: [{ action: 'manage', groupId: null, subject: 'Instrument' }],
  username: 'test-user'
};

describe('InstrumentsController', () => {
  let instrumentsController: InstrumentsController;
  let instrumentsService: MockedInstance<InstrumentsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [MockFactory.createForService(InstrumentsService)]
    }).compile();
    instrumentsController = moduleRef.get(InstrumentsController);
    instrumentsService = moduleRef.get(InstrumentsService);
  });

  it('should be defined', () => {
    expect(instrumentsController).toBeDefined();
    expect(instrumentsService).toBeDefined();
  });

  it('scopes instrument info to the requested current group', async () => {
    const ability = { can: vi.fn(() => false) };
    const currentUser = { ability, groups: [{ id: 'group-1' }, { id: 'group-2' }] } as any;
    instrumentsService.findInfo.mockResolvedValue([]);

    await instrumentsController.findInfo(currentUser, undefined, 'group-1');

    expect(instrumentsService.findInfo).toHaveBeenCalledWith(
      { kind: undefined, subjectId: undefined },
      currentUser,
      'group-1'
    );
  });

  it('should accept an instrument token on create and no other handler, so the minted token can only upload', () => {
    const handlerNames = Object.getOwnPropertyNames(InstrumentsController.prototype).filter(
      (name) => name !== 'constructor'
    );
    const accepting = handlerNames.filter((name) =>
      new Reflector().get<true | undefined>(
        ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY,
        Object.getOwnPropertyDescriptor(InstrumentsController.prototype, name)!.value
      )
    );
    expect(accepting).toEqual(['create']);
  });

  // Every group's series, and retiring one, belong to administrators alone: a group manager may create
  // and delete their own group's series, which the guard would not tell apart from any other.
  describe.each(['findSeriesOverview', 'updateSeriesArchive'] as const)('route access for %s', (handlerName) => {
    const abilityFor = (basePermissionLevel: BasePermissionLevel) =>
      new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService).createForPayload({
        basePermissionLevel,
        firstName: 'Test',
        groups: [{ id: 'group-1' }] as Group[],
        id: 'user-1',
        kind: 'login',
        lastName: 'User',
        mustResetPassword: false,
        username: 'test-user'
      });
    const { action, subject } = new Reflector().get<ProtectedRoutePermissionSet>(
      ROUTE_ACCESS_METADATA_KEY,
      Object.getOwnPropertyDescriptor(InstrumentsController.prototype, handlerName)!.value
    );

    it('should refuse a group manager, who may otherwise create and delete their own series', () => {
      expect(abilityFor('GROUP_MANAGER').can(action, subject)).toBe(false);
    });

    it('should allow an administrator', () => {
      expect(abilityFor('ADMIN').can(action, subject)).toBe(true);
    });
  });

  it('should hand the caller ability to the series overview, so the group lookup stays scoped', async () => {
    const ability = { can: vi.fn(() => true) } as any;
    instrumentsService.findSeriesOverview.mockResolvedValue([]);

    await instrumentsController.findSeriesOverview(ability);

    expect(instrumentsService.findSeriesOverview).toHaveBeenCalledWith({ ability });
  });

  it('should hand an uploaded bundle to the service unchanged, so it is interpreted exactly as authored', async () => {
    instrumentsService.create.mockResolvedValue({ id: 'instrument-1' });

    await expect(instrumentsController.create({ bundle: '__BUNDLE__' })).resolves.toEqual({ id: 'instrument-1' });
    expect(instrumentsService.create).toHaveBeenCalledWith({ bundle: '__BUNDLE__' });
  });

  it('should create a series on behalf of the current user, so the target group is checked against them', async () => {
    const data = {
      details: { title: 'Series' },
      groupId: 'group-1',
      items: [
        { edition: 1, name: 'FORM_A' },
        { edition: 1, name: 'FORM_B' }
      ],
      language: 'en' as const
    };
    instrumentsService.createSeries.mockResolvedValue({ instrumentId: 'series-1', outcome: 'created' });

    await expect(instrumentsController.createSeries(data, currentUser)).resolves.toEqual({
      instrumentId: 'series-1',
      outcome: 'created'
    });
    expect(instrumentsService.createSeries).toHaveBeenCalledWith(data, currentUser);
  });

  it('should delete on behalf of the current user, so only an instrument they may delete is removed', async () => {
    instrumentsService.deleteById.mockResolvedValue({ id: 'series-1' });

    await expect(instrumentsController.delete('series-1', currentUser)).resolves.toEqual({ id: 'series-1' });
    expect(instrumentsService.deleteById).toHaveBeenCalledWith('series-1', currentUser);
  });

  it('should look a bundle up within the requested group, so a series is served only to its owners', async () => {
    const container = { bundle: '__BUNDLE__', id: 'form-1', kind: 'FORM' as const };
    instrumentsService.findBundleById.mockResolvedValue(container);

    await expect(instrumentsController.findBundleById('form-1', currentUser, 'group-1')).resolves.toBe(container);
    expect(instrumentsService.findBundleById).toHaveBeenCalledWith('form-1', currentUser, 'group-1');
  });

  it('should list instruments of the requested kind within the requested group', async () => {
    const listed = [{ id: 'form-1', internal: { edition: 1, name: 'FORM_A' }, title: 'Form A' }];
    instrumentsService.list.mockResolvedValue(listed);

    await expect(instrumentsController.list(currentUser, 'group-1', 'FORM')).resolves.toBe(listed);
    expect(instrumentsService.list).toHaveBeenCalledWith({ kind: 'FORM' }, currentUser, 'group-1');
  });

  it('should archive on behalf of the current user, so the change is audited under their id', async () => {
    const archivedAt = new Date('2024-06-01T00:00:00.000Z');
    instrumentsService.updateSeriesArchive.mockResolvedValue({ archivedAt, id: 'series-1' });

    await expect(
      instrumentsController.updateSeriesArchive('series-1', { isArchived: true }, currentUser)
    ).resolves.toEqual({ archivedAt, id: 'series-1' });
    expect(instrumentsService.updateSeriesArchive).toHaveBeenCalledWith('series-1', { isArchived: true }, currentUser);
  });
});
