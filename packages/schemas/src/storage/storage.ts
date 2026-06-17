import { z } from 'zod/v4';

export type $FileLocation = z.infer<typeof $FileLocation>;
export const $FileLocation = z.object({
  basename: z.string(),
  index: z.int()
});

export type $FileMetadata = z.infer<typeof $FileMetadata>;
export const $FileMetadata = z.object({
  location: $FileLocation,
  name: z.string().min(1),
  size: z.int().nonnegative()
});

export type $PresignedUrlInfo = z.infer<typeof $PresignedUrlInfo>;
export const $PresignedUrlInfo = z.object({
  exp: z.int(),
  location: $FileLocation,
  url: z.url()
});

export type $PresignedUrls = z.infer<typeof $PresignedUrls>;
export const $PresignedUrls = z.record(z.string(), z.array($PresignedUrlInfo));

export type $UploadCompleteData = z.infer<typeof $UploadCompleteData>;
export const $UploadCompleteData = z.object({
  uploads: z.record(z.string(), z.array($FileMetadata))
});
