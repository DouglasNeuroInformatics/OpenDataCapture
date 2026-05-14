import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { $FileSearchParams } from '@opendatacapture/schemas/instrument-records';
import type { $PresignedUrlInfo } from '@opendatacapture/schemas/storage';

export type StorageKey = `groups/${null | string}/records/${string}/files/${string}`;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly bucket: string;
  private readonly publicStorageEndpoint: string;
  private readonly storageEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3: S3Client
  ) {
    this.bucket = this.configService.get('STORAGE_BUCKET');
    this.storageEndpoint = this.configService.get('STORAGE_ENDPOINT');
    this.publicStorageEndpoint = this.configService.get('STORAGE_PUBLIC_ENDPOINT') ?? this.storageEndpoint;
  }

  async getPresignedDownloadUrl(params: $FileSearchParams): Promise<$PresignedUrlInfo> {
    const key = this.getStorageKey(params);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${params.fileId}"`
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 15 });
    const publicUrl = this.transformUrlForPublicAccess(url);
    const exp = Date.now() + 1000 * 60 * 15; // 15 minutes for downloads
    return { exp, key, url: publicUrl };
  }

  async getPresignedUploadUrl(params: $FileSearchParams): Promise<$PresignedUrlInfo> {
    const key = this.getStorageKey(params);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 });
    const publicUrl = this.transformUrlForPublicAccess(url);
    const exp = Date.now() + 1000 * 60 * 5; // make sure computed after generation
    return { exp, key, url: publicUrl };
  }

  async onModuleInit(): Promise<void> {
    if (this.configService.get('NODE_ENV') !== 'test') {
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      } catch {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      }
    }
  }

  private getStorageKey(params: $FileSearchParams): StorageKey {
    return `groups/${params.groupId}/records/${params.recordId}/files/${params.fileId}`;
  }

  private transformUrlForPublicAccess(url: string): string {
    if (this.publicStorageEndpoint === this.storageEndpoint) {
      return url;
    }
    return url.replace(this.storageEndpoint, this.publicStorageEndpoint);
  }
}
