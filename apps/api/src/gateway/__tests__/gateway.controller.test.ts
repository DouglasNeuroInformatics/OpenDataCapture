import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { GatewayController } from '../gateway.controller';
import { GatewayService } from '../gateway.service';

describe('GatewayController', () => {
  let gatewayController: GatewayController;
  let gatewayService: MockedInstance<GatewayService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [MockFactory.createForService(GatewayService)]
    }).compile();
    gatewayController = moduleRef.get(GatewayController);
    gatewayService = moduleRef.get(GatewayService);
  });

  describe('healthcheck', () => {
    it('should return the healthcheck result reported by the gateway service', async () => {
      const result = { ok: false, status: 503, statusText: 'Service Unavailable' } as const;
      gatewayService.healthcheck.mockResolvedValueOnce(result);
      await expect(gatewayController.healthcheck()).resolves.toBe(result);
    });
  });
});
