import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { InternalServerErrorException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY } from '@/core/decorators/accepts-instrument-token.decorator.js';
import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator.js';
import type { RouteAccessType } from '@/core/decorators/route-access.decorator.js';

import { AbilityFactory } from '../../ability.factory.js';
import { JwtAuthGuard } from '../jwt-auth.guard.js';

const BaseConstructor = vi.hoisted(() => {
  const constructor = vi.fn();
  constructor.prototype.canActivate = vi.fn();
  return constructor;
});

vi.mock('@nestjs/passport', () => ({ AuthGuard: () => BaseConstructor }));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  let abilityFactory: AbilityFactory;
  let loggingService: MockedInstance<LoggingService>;
  let reflector: MockedInstance<Reflector>;

  let context: MockedInstance<ExecutionContext>;
  let getRequest: Mock<() => Partial<Request>>;

  beforeEach(() => {
    getRequest = vi.fn().mockReturnValue({ url: 'http://localhost:5500' });
    context = {
      getHandler: vi.fn(),
      switchToHttp: vi.fn(() => ({ getRequest, getResponse: vi.fn() }))
    } satisfies Partial<MockedInstance<ExecutionContext>> as MockedInstance<ExecutionContext>;
    loggingService = MockFactory.createMock(LoggingService);
    reflector = MockFactory.createMock(Reflector);
    guard = new JwtAuthGuard(loggingService as any, reflector);
    abilityFactory = new AbilityFactory(loggingService as unknown as LoggingService);
  });

  it('should extend BaseConstructor', () => {
    expect(BaseConstructor).toHaveBeenCalled();
  });

  it('should return true for a public route', async () => {
    reflector.get.mockReturnValueOnce('public' satisfies RouteAccessType);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(loggingService.verbose).toHaveBeenCalledTimes(2);
    expect(loggingService.verbose).toHaveBeenLastCalledWith('Granting access for public route: http://localhost:5500');
  });

  it('should throw an InternalServerError if RouteAccess is not defined for a route', async () => {
    reflector.get.mockReturnValueOnce(undefined);
    await expect(guard.canActivate(context)).rejects.toThrowError(InternalServerErrorException);
    expect(loggingService.error).toHaveBeenLastCalledWith(`Route access is not defined for url: http://localhost:5500`);
  });

  it('should return false for a protected route, if AuthGuard.canActivate returns false', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(false);
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should return false for a protected route, if AuthGuard.canActivate returns a truthy, non-boolean value', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce({});
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should throw an InternalServerError if, for some reason, there is no user ability for the request', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
    await expect(guard.canActivate(context)).rejects.toThrowError(InternalServerErrorException);
    expect(loggingService.error).toHaveBeenLastCalledWith(
      'User property of request does not include expected AppAbility'
    );
  });

  it('should return false for a protected route, if the user does not have the right permissions', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
    const ability = abilityFactory.createForPermissions([{ action: 'manage', subject: 'Group' }]);
    getRequest.mockReturnValueOnce({ url: 'http://localhost:5500', user: { ability } as any });
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should return false for a protected route, if the user has only some of the right permissions', async () => {
    reflector.get.mockReturnValueOnce([
      {
        action: 'read',
        subject: 'Assignment'
      },
      {
        action: 'update',
        subject: 'Group'
      }
    ] satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
    const ability = abilityFactory.createForPermissions([{ action: 'read', subject: 'Instrument' }]);
    getRequest.mockReturnValueOnce({ url: 'http://localhost:5500', user: { ability } as any });
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should return true for a protected route, if the user has the right permissions', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
    const ability = abilityFactory.createForPermissions([{ action: 'manage', subject: 'all' }]);
    getRequest.mockReturnValueOnce({ url: 'http://localhost:5500', user: { ability } as any });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  describe('instrument token', () => {
    const MANAGE_INSTRUMENT = { action: 'manage', subject: 'Instrument' } satisfies RouteAccessType;

    const declareRoute = (routeAccess: RouteAccessType, acceptsInstrumentToken?: true) => {
      const metadata: { [key: string]: unknown } = {
        [ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY]: acceptsInstrumentToken,
        [ROUTE_ACCESS_METADATA_KEY]: routeAccess
      };
      reflector.get.mockImplementation((key: string) => metadata[key]);
    };

    const sendTokenOfKind = (kind: 'instrument' | 'login' | undefined) => {
      BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
      const ability = abilityFactory.createForPermissions([MANAGE_INSTRUMENT]);
      getRequest.mockReturnValueOnce({ url: 'http://localhost:5500', user: { ability, kind } as any });
    };

    it('should refuse it on an unmarked route its permissions satisfy, so it cannot mint its own successor', async () => {
      declareRoute(MANAGE_INSTRUMENT);
      sendTokenOfKind('instrument');
      await expect(guard.canActivate(context)).resolves.toBe(false);
    });

    it('should admit it on a route marked to accept one, so the playground can upload a bundle', async () => {
      declareRoute(MANAGE_INSTRUMENT, true);
      sendTokenOfKind('instrument');
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('should still hold it to the route access declaration on a marked route', async () => {
      declareRoute({ action: 'manage', subject: 'all' }, true);
      sendTokenOfKind('instrument');
      await expect(guard.canActivate(context)).resolves.toBe(false);
    });

    it('should admit a login token on an unmarked route its permissions satisfy', async () => {
      declareRoute(MANAGE_INSTRUMENT);
      sendTokenOfKind('login');
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('should treat a token signed before kind existed as a login token, so sessions open at deploy survive it', async () => {
      declareRoute(MANAGE_INSTRUMENT);
      sendTokenOfKind(undefined);
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });
});
