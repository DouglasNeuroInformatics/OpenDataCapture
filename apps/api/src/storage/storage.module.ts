import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@douglasneuroinformatics/libnest';
import { Module } from '@nestjs/common';

import { StorageService } from './storage.service';

@Module({
  exports: [StorageService],
  providers: [
    {
      inject: [ConfigService],
      provide: S3Client,
      useFactory: (configService: ConfigService): S3Client => {
        return new S3Client({
          credentials: {
            accessKeyId: configService.get('STORAGE_ACCESS_KEY'),
            secretAccessKey: configService.get('STORAGE_SECRET_KEY')
          },
          endpoint: configService.get('STORAGE_ENDPOINT'),
          forcePathStyle: true,
          region: configService.get('STORAGE_REGION')
        });
      }
    },
    StorageService
  ]
})
export class StorageModule {}
