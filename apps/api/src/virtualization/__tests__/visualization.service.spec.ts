import { Test } from '@nestjs/testing';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { maliciousInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { beforeEach, describe, expect, it } from 'vitest';

import { VirtualizationService } from '../virtualization.service';

describe('VisualizationService', () => {
  let virtualizationService: VirtualizationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VirtualizationService]
    }).compile();
    virtualizationService = moduleRef.get(VirtualizationService);
  });

  describe('getInstrumentInstance', () => {
    it('should return a valid form instrument', async () => {
      const result = await virtualizationService.getInstrumentInstance({
        bundle: unilingualFormInstrument.bundle,
        id: '1'
      });
      expect(result).toMatchObject(unilingualFormInstrument.instance);
    });
    it('should reject code containing "eval"', async () => {
      await expect(() => {
        return virtualizationService.getInstrumentInstance({
          bundle: maliciousInstrument.bundle,
          id: '1'
        });
      }).rejects.toThrowError();
    });
  });
});
