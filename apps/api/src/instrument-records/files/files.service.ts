import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import type { FileInstrument } from '@opendatacapture/runtime-core';
import type { $InstrumentRecordFile, $InstrumentRecordFiles } from '@opendatacapture/schemas/instrument-records';
import type { $FileMetadata, $PresignedUrls, $UploadCompleteData } from '@opendatacapture/schemas/storage';
import { range } from 'lodash-es';

import { accessibleQuery, forcedAppSubject } from '@/auth/ability.utils';
import { InstrumentsService } from '@/instruments/instruments.service';
import { StorageService } from '@/storage/storage.service';

import type { FileUploadAssociations } from './files.types';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    private readonly instrumentsService: InstrumentsService,
    private readonly storageService: StorageService
  ) {}

  async find(recordId: string, currentUser: RequestUser): Promise<$InstrumentRecordFiles> {
    const record = await this.instrumentRecordModel.findUnique({
      include: {
        files: true
      },
      where: {
        AND: [
          accessibleQuery(currentUser.ability, 'read', 'InstrumentRecord'),
          {
            files: {
              every: accessibleQuery(currentUser.ability, 'read', 'InstrumentRecordFile')
            }
          }
        ],
        id: recordId
      }
    });

    if (!record) {
      throw new NotFoundException(`Could not find record with ID '${recordId}'`);
    }

    const instrument = await this.findFileInstrumentById(record.instrumentId);

    const files: { [basename: string]: $InstrumentRecordFile[] } = {};
    for (const fileGroup of instrument.content.fileGroups) {
      const groupFiles = record.files
        .filter((file) => file.basename === fileGroup.basename)
        .toSorted((a, b) => a.index - b.index);
      files[fileGroup.basename] = await Promise.all(
        groupFiles.map(async (file) => {
          const presigned = await this.storageService.getPresignedDownloadUrl({
            groupId: file.groupId,
            location: {
              basename: file.basename,
              index: file.index
            },
            recordId: file.recordId
          });
          return {
            exp: presigned.exp,
            name: file.name,
            size: file.size,
            url: presigned.url
          };
        })
      );
    }

    return files;
  }

  async getPresignedUploadUrls(recordId: string, currentUser: RequestUser): Promise<$PresignedUrls> {
    const { groupId, instrument } = await this.getAssociations(recordId, currentUser);

    const presignedUrls: $PresignedUrls = {};
    for (const fileGroup of instrument.content.fileGroups) {
      presignedUrls[fileGroup.basename] = await Promise.all(
        range(fileGroup.count.max + 1).map((index) => {
          return this.storageService.getPresignedUploadUrl({
            groupId,
            location: {
              basename: fileGroup.basename,
              index
            },
            recordId
          });
        })
      );
    }

    return presignedUrls;
  }

  async setUploadComplete(recordId: string, data: $UploadCompleteData, currentUser: RequestUser): Promise<void> {
    const { groupId, instrument } = await this.getAssociations(recordId, currentUser);
    await this.instrumentRecordModel.update({
      data: {
        files: {
          create: this.validateFiles(data.uploads, instrument.content.fileGroups).map((file) => ({
            basename: file.location.basename,
            group: groupId ? { connect: groupId } : undefined,
            index: file.location.index,
            name: file.name,
            size: file.size
          }))
        },
        pending: false
      },
      where: {
        id: recordId
      }
    });
  }

  private async findFileInstrumentById(instrumentId: string): Promise<FileInstrument> {
    const instrument = await this.instrumentsService.findById(instrumentId);
    if (instrument.kind !== 'FILE') {
      throw new UnprocessableEntityException('Cannot perform operation for non-file instrument');
    }
    return instrument;
  }

  private async getAssociations(recordId: string, currentUser: RequestUser): Promise<FileUploadAssociations> {
    const record = await this.instrumentRecordModel.findUnique({
      select: {
        groupId: true,
        instrumentId: true,
        pending: true
      },
      where: {
        id: recordId
      }
    });

    if (!record) {
      throw new NotFoundException(`Could not find record with ID '${recordId}'`);
    } else if (!record.pending) {
      throw new ConflictException('Upload already completed');
    }

    const canUpload = currentUser.ability.can(
      'create',
      forcedAppSubject('InstrumentRecordFile', { groupId: record.groupId })
    );

    if (!canUpload) {
      throw new ForbiddenException(`Cannot upload files for record with ID '${recordId}'`);
    }

    const instrument = await this.findFileInstrumentById(record.instrumentId);

    return {
      groupId: record.groupId,
      instrument
    };
  }

  private validateFiles(
    uploads: { [id: string]: $FileMetadata[] },
    fileGroups: FileInstrument.FileGroup[]
  ): $FileMetadata[] {
    const validatedFiles: $FileMetadata[] = [];
    for (const fileGroup of fileGroups) {
      const uploadedFiles = uploads[fileGroup.basename];
      const actual = uploadedFiles?.length ?? 0;
      const { max, min } = fileGroup.count;
      if (actual < min || actual > max) {
        const expected = min === max ? `${min}` : `between ${min} and ${max}`;
        throw new BadRequestException(
          `Invalid file count for file group '${fileGroup.basename}': expected ${expected} file(s), but got '${actual}'`
        );
      }
      for (const file of uploadedFiles!) {
        validatedFiles.push(file);
      }
    }
    return validatedFiles;
  }
}
