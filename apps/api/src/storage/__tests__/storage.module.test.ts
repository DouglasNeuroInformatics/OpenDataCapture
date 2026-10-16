import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { StorageModule } from '../storage.module';
import { StorageService } from '../storage.service';

type StorageEnv = {
  STORAGE_ACCESS_KEY?: string;
  STORAGE_BUCKET?: string;
  STORAGE_ENABLED?: boolean;
  STORAGE_ENDPOINT?: string;
  STORAGE_REGION?: string;
  STORAGE_SECRET_KEY?: string;
};

/** Compile `StorageModule` against a global `ConfigService` answering from `env`, as libnest provides it. */
async function compileStorageModule(env: StorageEnv) {
  const configService = MockFactory.createMock(ConfigService);
  configService.get.mockImplementation((key: string) => env[key as keyof StorageEnv]);

  @Global()
  @Module({ exports: [ConfigService], providers: [{ provide: ConfigService, useValue: configService }] })
  class GlobalConfigModule {}

  return Test.createTestingModule({ imports: [GlobalConfigModule, StorageModule] }).compile();
}

describe('StorageModule', () => {
  it('should provide no client when storage is disabled, so nothing tries to reach a bucket', async () => {
    const moduleRef = await compileStorageModule({});
    expect(moduleRef.get(S3Client)).toBeNull();
    expect(moduleRef.get(StorageService).isEnabled).toBe(false);
  });

  it('should configure the client from the environment, addressing buckets by path as MinIO requires', async () => {
    const moduleRef = await compileStorageModule({
      STORAGE_ACCESS_KEY: 'access-key',
      STORAGE_BUCKET: 'odc',
      STORAGE_ENABLED: true,
      STORAGE_ENDPOINT: 'http://minio:9000',
      STORAGE_REGION: 'ca-central-1',
      STORAGE_SECRET_KEY: 'secret-key'
    });
    const client = moduleRef.get(S3Client);

    expect(client).toBeInstanceOf(S3Client);
    expect(client.config.forcePathStyle).toBe(true);
    await expect(client.config.region()).resolves.toBe('ca-central-1');
    await expect(client.config.credentials()).resolves.toMatchObject({
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key'
    });
    await expect(client.config.endpoint!()).resolves.toMatchObject({ hostname: 'minio', port: 9000 });
  });
});
