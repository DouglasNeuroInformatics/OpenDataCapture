import { CurrentUser, ValidObjectIdPipe } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { $InstrumentRecordFiles } from '@opendatacapture/schemas/instrument-records';
// import type { $InstrumentRecordFiles } from '@opendatacapture/schemas/instrument-records';
import { $PresignedUrls, $UploadCompleteData } from '@opendatacapture/schemas/storage';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { FilesService } from './files.service';

@Controller('instrument-records/:recordId/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecordFile' })
  find(
    @Param('recordId', ValidObjectIdPipe) recordId: string,
    @CurrentUser() currentUser: RequestUser
  ): Promise<$InstrumentRecordFiles> {
    return this.filesService.find(recordId, currentUser);
  }

  @Get('upload-urls')
  @RouteAccess({ action: 'create', subject: 'InstrumentRecordFile' })
  getUploadUrls(
    @Param('recordId', ValidObjectIdPipe) recordId: string,
    @CurrentUser() currentUser: RequestUser
  ): Promise<$PresignedUrls> {
    return this.filesService.getPresignedUploadUrls(recordId, currentUser);
  }

  @Post('upload-complete')
  @RouteAccess({ action: 'create', subject: 'InstrumentRecordFile' })
  setUploadComplete(
    @Param('recordId', ValidObjectIdPipe) recordId: string,
    @Body() data: $UploadCompleteData,
    @CurrentUser() currentUser: RequestUser
  ): Promise<void> {
    return this.filesService.setUploadComplete(recordId, data, currentUser);
  }
}
