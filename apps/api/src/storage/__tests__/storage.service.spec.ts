import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorageService } from '../storage.service';

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
});
