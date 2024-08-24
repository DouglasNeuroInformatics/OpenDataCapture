import vm from 'vm';

import { Test } from '@nestjs/testing';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { VirtualizationService } from '../virtualization.service';

describe('VisualizationService', () => {
  let runInContext: Mock;
  let virtualizationService: VirtualizationService;

  beforeAll(() => {
    runInContext = vi.fn();
    vi.spyOn(vm, 'runInContext').mockImplementation(runInContext);
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VirtualizationService]
    }).compile();
    virtualizationService = moduleRef.get(VirtualizationService);
  });

  describe('getInstrumentInstance', () => {
    it('should call vm.runInContext with the bundle', async () => {
      expect(runInContext).not.toHaveBeenCalled();
      await virtualizationService.getInstrumentInstance({
        bundle: unilingualFormInstrument.bundle,
        id: '1'
      });
      expect(runInContext).toHaveBeenCalledOnce();
      expect(runInContext).toHaveBeenLastCalledWith(
        unilingualFormInstrument.bundle,
        expect.anything(),
        expect.anything()
      );
    });
    it('should return the result of vm.runInContext with the ID property added', async () => {
      runInContext.mockResolvedValueOnce(unilingualFormInstrument.instance);
      await expect(
        virtualizationService.getInstrumentInstance({
          bundle: unilingualFormInstrument.bundle,
          id: '1'
        })
      ).resolves.toMatchObject({ ...unilingualFormInstrument.instance, id: '1' });
    });
  });
});
