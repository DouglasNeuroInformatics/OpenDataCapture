import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { CryptoService } from '../crypto.service';

import { MockConfigService } from '@/core/test/mocks/config.service.mock';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: MockConfigService
        }
      ]
    }).compile();
    cryptoService = module.get(CryptoService);
  });

  describe('hash', () => {
    it('should create a hash that is not equal to the input value', () => {
      expect(cryptoService.hash('foo')).not.toBe('foo');
    });

    it('should create two hashes with the same value', () => {
      const h1 = cryptoService.hash('foo');
      const h2 = cryptoService.hash('foo');
      expect(h1).toBe(h2);
    });
  });

  describe('hashPassword', () => {
    it('should create a hash that is not equal to the input value', async () => {
      await expect(cryptoService.hashPassword('foo')).resolves.not.toBe('foo');
    });

    it('should create two different hashes for the same value, both of which can be verified', async () => {
      const h1 = await cryptoService.hashPassword('foo');
      const h2 = await cryptoService.hashPassword('foo');
      expect(h1).not.toBe(h2);
      await expect(cryptoService.comparePassword('foo', h1)).resolves.toBe(true);
      await expect(cryptoService.comparePassword('foo', h2)).resolves.toBe(true);
    });

    it('should return false when comparing a hash with an incorrect value', async () => {
      const hash = await cryptoService.hashPassword('foo');
      await expect(cryptoService.comparePassword('bar', hash)).resolves.toBe(false);
    });
  });
});
