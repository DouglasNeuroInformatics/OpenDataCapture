import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';

import { FilesController } from '../files.controller';
import { FilesService } from '../files.service';

const currentUser: RequestUser = {
  ability: createAppAbility([{ action: 'manage', subject: 'all' }]),
  basePermissionLevel: null,
  firstName: null,
  groups: [],
  id: 'user-1',
  kind: 'login',
  lastName: null,
  mustResetPassword: false,
  permissions: [],
  username: 'jane.doe'
};

describe('FilesController', () => {
  let filesController: FilesController;
  let filesService: MockedInstance<FilesService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [MockFactory.createForService(FilesService)]
    }).compile();
    filesController = moduleRef.get(FilesController);
    filesService = moduleRef.get(FilesService);
  });

  it('should return the files the service finds for the record and user', async () => {
    const files = { scan: [{ exp: 1, name: 'scan.csv', size: 10, url: 'https://storage.example.org/scan' }] };
    filesService.find.mockResolvedValueOnce(files);
    await expect(filesController.find('record-1', currentUser)).resolves.toBe(files);
    expect(filesService.find).toHaveBeenCalledWith('record-1', currentUser);
  });

  it('should return the presigned upload urls the service creates for the record and user', async () => {
    const urls = { scan: [{ exp: 1, location: { basename: 'scan', index: 0 }, url: 'https://storage.example.org' }] };
    filesService.getPresignedUploadUrls.mockResolvedValueOnce(urls);
    await expect(filesController.getUploadUrls('record-1', currentUser)).resolves.toBe(urls);
    expect(filesService.getPresignedUploadUrls).toHaveBeenCalledWith('record-1', currentUser);
  });

  it('should forward the completed uploads to the service for the record and user', async () => {
    const data = { uploads: { scan: [{ location: { basename: 'scan', index: 0 }, name: 'scan.csv', size: 10 }] } };
    await filesController.setUploadComplete('record-1', data, currentUser);
    expect(filesService.setUploadComplete).toHaveBeenCalledWith('record-1', data, currentUser);
  });
});
