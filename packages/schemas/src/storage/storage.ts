import { z } from 'zod/v4';

export type $FileMetadata = z.infer<typeof $FileMetadata>;
export const $FileMetadata = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  size: z.int().nonnegative()
});

export type $PresignedUrlInfo = z.infer<typeof $PresignedUrlInfo>;
export const $PresignedUrlInfo = z.object({
  exp: z.int(),
  key: z.string(),
  url: z.url()
});

export type $PresignedUrls = z.infer<typeof $PresignedUrls>;
export const $PresignedUrls = z.record(z.string(), z.array($PresignedUrlInfo));

export type $UploadCompleteData = z.infer<typeof $UploadCompleteData>;
export const $UploadCompleteData = z.object({
  uploads: z.record(z.string(), z.array($FileMetadata))
});
