import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Group } from '@opendatacapture/schemas/group';
import type { BasePermissionLevel } from '@opendatacapture/schemas/user';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY } from '@/core/decorators/accepts-instrument-token.decorator';
import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator';
import type { ProtectedRoutePermissionSet } from '@/core/decorators/route-access.decorator';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

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
});
