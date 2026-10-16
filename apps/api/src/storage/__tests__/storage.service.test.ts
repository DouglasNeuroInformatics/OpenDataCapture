import { CreateBucketCommand, DeleteObjectsCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StorageService } from '../storage.service';

/** The environment `ConfigService` reads storage settings from. */
type StorageEnv = {
  NODE_ENV?: string;
  STORAGE_BUCKET?: string;
  STORAGE_ENABLED?: boolean;
  STORAGE_ENDPOINT?: string;
  STORAGE_PUBLIC_ENDPOINT?: string;
};

/** A real client, so presigning runs offline exactly as it does against MinIO. */
const createS3Client = () =>
  new S3Client({
    credentials: { accessKeyId: 'access-key', secretAccessKey: 'secret-key' },
    endpoint: 'http://minio:9000',
    forcePathStyle: true,
    region: 'us-east-1'
  });

async function createStorageService(env: StorageEnv, s3: null | Pick<S3Client, 'send'> | S3Client) {
  const configService = MockFactory.createMock(ConfigService);
  configService.get.mockImplementation((key: string) => env[key as keyof StorageEnv]);
  const moduleRef = await Test.createTestingModule({
    providers: [
      StorageService,
      { provide: ConfigService, useValue: configService },
      { provide: S3Client, useValue: s3 }
    ]
  }).compile();
  return moduleRef.get(StorageService);
}

const enabledEnv: StorageEnv = { STORAGE_BUCKET: 'test-bucket', STORAGE_ENABLED: true };

describe('StorageService', () => {
  let storageService: StorageService;
  let configService: MockedInstance<ConfigService>;
  const send = vi.fn();
  const files = [
    { groupId: 'group-1', location: { basename: 'file', index: 0 }, recordId: 'record-1' },
    { groupId: null, location: { basename: 'image', index: 2 }, recordId: 'record-2' }
  ];

  beforeEach(async () => {
    send.mockReset().mockResolvedValue({});
    const configModule = await Test.createTestingModule({
      providers: [MockFactory.createForService(ConfigService)]
    }).compile();
    configService = configModule.get(ConfigService);
    configService.get.mockImplementation((key) => {
      if (key === 'STORAGE_ENABLED') return true;
      if (key === 'STORAGE_BUCKET') return 'test-bucket';
      return undefined;
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: configService },
        { provide: S3Client, useValue: { send } }
      ]
    }).compile();
    storageService = moduleRef.get(StorageService);
  });

  it('should delete grouped and root files with their existing storage keys', async () => {
    await storageService.deleteObjects(files);
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.lastCall?.[0]).toBeInstanceOf(DeleteObjectsCommand);
    expect(send.mock.lastCall?.[0].input).toEqual({
      Bucket: 'test-bucket',
      Delete: {
        Objects: [
          { Key: 'groups/group-1/records/record-1/files/file_0' },
          { Key: 'groups/__ROOT__/records/record-2/files/image_2' }
        ]
      }
    });
  });

  it('should skip storage entirely when there are no files', async () => {
    await storageService.deleteObjects([]);
    expect(send).not.toHaveBeenCalled();
  });

  it('should split requests at the S3 limit of one thousand objects', async () => {
    await storageService.deleteObjects(Array.from({ length: 1001 }, () => files[0]!));
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]![0].input.Delete.Objects).toHaveLength(1000);
    expect(send.mock.calls[1]![0].input.Delete.Objects).toHaveLength(1);
  });

  it('should reject per-object errors even when S3 accepts the request', async () => {
    send.mockResolvedValueOnce({ Errors: [{ Code: 'AccessDenied', Key: 'failed-key' }] });
    await expect(storageService.deleteObjects(files)).rejects.toThrow('AccessDenied');
  });

  it('should propagate a failed storage request', async () => {
    send.mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(storageService.deleteObjects(files)).rejects.toThrow('storage unavailable');
  });

  it('should reject nonempty cleanup when storage is unavailable', async () => {
    configService.get.mockReturnValue(undefined);
    const moduleRef = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: configService },
        { provide: S3Client, useValue: null }
      ]
    }).compile();
    const disabledStorage = moduleRef.get(StorageService);
    await expect(disabledStorage.deleteObjects(files)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(disabledStorage.deleteObjects([])).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  describe('isEnabled', () => {
    it('should report storage enabled when the environment enables it', () => {
      expect(storageService.isEnabled).toBe(true);
    });

    it('should report storage disabled when the environment leaves it unset', async () => {
      const disabledStorage = await createStorageService({}, null);
      expect(disabledStorage.isEnabled).toBe(false);
    });
  });

  describe('onModuleInit', () => {
    it('should not contact storage when it is disabled', async () => {
      const disabledStorage = await createStorageService({ STORAGE_BUCKET: 'test-bucket' }, { send });
      await disabledStorage.onModuleInit();
      expect(send).not.toHaveBeenCalled();
    });

    it('should not contact storage under test, where no bucket server runs', async () => {
      const testStorage = await createStorageService({ ...enabledEnv, NODE_ENV: 'test' }, { send });
      await testStorage.onModuleInit();
      expect(send).not.toHaveBeenCalled();
    });

    it('should leave an existing bucket alone', async () => {
      const liveStorage = await createStorageService({ ...enabledEnv, NODE_ENV: 'production' }, { send });
      await liveStorage.onModuleInit();
      expect(send).toHaveBeenCalledOnce();
      expect(send.mock.lastCall?.[0]).toBeInstanceOf(HeadBucketCommand);
      expect(send.mock.lastCall?.[0].input).toEqual({ Bucket: 'test-bucket' });
    });

    it('should create the bucket when it does not exist yet', async () => {
      send.mockRejectedValueOnce(new Error('NotFound'));
      const liveStorage = await createStorageService({ ...enabledEnv, NODE_ENV: 'production' }, { send });
      await liveStorage.onModuleInit();
      expect(send.mock.lastCall?.[0]).toBeInstanceOf(CreateBucketCommand);
      expect(send.mock.lastCall?.[0].input).toEqual({ Bucket: 'test-bucket' });
    });

    it('should refuse to start enabled storage with no bucket configured', async () => {
      const misconfigured = await createStorageService({ NODE_ENV: 'production', STORAGE_ENABLED: true }, { send });
      await expect(misconfigured.onModuleInit()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('presigned urls', () => {
    const params = { groupId: 'group-1', location: { basename: 'scan', index: 3 }, recordId: 'record-1' };

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should sign an upload to the record file key, valid for five minutes', async () => {
      vi.useFakeTimers({ now: new Date('2025-01-01T00:00:00.000Z') });
      const presigning = await createStorageService(
        { ...enabledEnv, STORAGE_ENDPOINT: 'http://minio:9000' },
        createS3Client()
      );

      const { exp, location, url } = await presigning.getPresignedUploadUrl(params);

      expect(location).toBe(params.location);
      expect(exp).toBe(Date.parse('2025-01-01T00:05:00.000Z'));
      expect(new URL(url).pathname).toBe('/test-bucket/groups/group-1/records/record-1/files/scan_3');
      expect(new URL(url).searchParams.get('X-Amz-Expires')).toBe('300');
    });

    it('should sign a download as an attachment named after the file, valid for fifteen minutes', async () => {
      vi.useFakeTimers({ now: new Date('2025-01-01T00:00:00.000Z') });
      const presigning = await createStorageService(
        { ...enabledEnv, STORAGE_ENDPOINT: 'http://minio:9000' },
        createS3Client()
      );

      const { exp, url } = await presigning.getPresignedDownloadUrl(params);

      expect(exp).toBe(Date.parse('2025-01-01T00:15:00.000Z'));
      expect(new URL(url).searchParams.get('X-Amz-Expires')).toBe('900');
      expect(new URL(url).searchParams.get('response-content-disposition')).toBe('attachment; filename="scan_3"');
    });

    it('should rewrite the url to the public endpoint, so a browser outside the network can reach it', async () => {
      const presigning = await createStorageService(
        { ...enabledEnv, STORAGE_ENDPOINT: 'http://minio:9000', STORAGE_PUBLIC_ENDPOINT: 'https://files.example.org' },
        createS3Client()
      );

      const { url } = await presigning.getPresignedDownloadUrl(params);

      expect(url.startsWith('https://files.example.org/test-bucket/')).toBe(true);
    });

    it('should leave the url as signed when no endpoint is configured', async () => {
      const presigning = await createStorageService(enabledEnv, createS3Client());

      const { url } = await presigning.getPresignedUploadUrl(params);

      expect(url.startsWith('http://minio:9000/test-bucket/')).toBe(true);
    });

    it('should refuse to sign when storage is not configured', async () => {
      const disabledStorage = await createStorageService({}, null);
      await expect(disabledStorage.getPresignedUploadUrl(params)).rejects.toBeInstanceOf(ServiceUnavailableException);
      await expect(disabledStorage.getPresignedDownloadUrl(params)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });
});
