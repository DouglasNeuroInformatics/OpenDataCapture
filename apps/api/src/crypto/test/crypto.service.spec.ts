import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { CryptoService } from '../crypto.service';

import { createMock } from '@/core/testing/create-mock';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            getOrThrow: (propertyPath: string) => propertyPath
          })
        }
      ]
    }).compile();
    cryptoService = module.get(CryptoService);
  });

  describe('hash', () => {
    it('should create a hash that is not equal to the input value', () => {
      assert(cryptoService.hash('foo') !== 'foo');
    });

    it('should create two hashes with the same value', () => {
      const h1 = cryptoService.hash('foo');
      const h2 = cryptoService.hash('foo');
      assert(h1 === h2);
    });
  });

  describe('hashPassword', () => {
    it('should create a hash that is not equal to the input value', async () => {
      const hashedPassword = await cryptoService.hashPassword('foo');
      assert(hashedPassword !== 'foo');
    });

    it('should create two different hashes for the same value, both of which can be verified', async () => {
      const h1 = await cryptoService.hashPassword('foo');
      const h2 = await cryptoService.hashPassword('foo');
      assert(h1 !== h2);
      assert(await cryptoService.comparePassword('foo', h1));
      assert(await cryptoService.comparePassword('foo', h2));
    });

    it('should return false when comparing a hash with an incorrect value', async () => {
      const hash = await cryptoService.hashPassword('foo');
      assert(!(await cryptoService.comparePassword('bar', hash)));
    });
  });
});
