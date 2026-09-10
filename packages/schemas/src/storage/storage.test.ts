import { describe, expect, it } from 'vitest';

import { $FileLocation, $FileMetadata, $PresignedUrlInfo, $PresignedUrls, $UploadCompleteData } from './storage.js';

describe('$FileLocation', () => {
  it('should accept a basename and non-negative integer index', () => {
    expect($FileLocation.safeParse({ basename: 'file.txt', index: 0 }).success).toBe(true);
  });
  it('should reject a non-integer index', () => {
    expect($FileLocation.safeParse({ basename: 'file.txt', index: 1.5 }).success).toBe(false);
  });
});

describe('$FileMetadata', () => {
  it('should accept a positive size and a non-empty name', () => {
    expect(
      $FileMetadata.safeParse({ location: { basename: 'file.txt', index: 0 }, name: 'file.txt', size: 100 }).success
    ).toBe(true);
  });
  it('should reject a negative size', () => {
    expect(
      $FileMetadata.safeParse({ location: { basename: 'file.txt', index: 0 }, name: 'file.txt', size: -1 }).success
    ).toBe(false);
  });
  it('should reject an empty name', () => {
    expect($FileMetadata.safeParse({ location: { basename: 'file.txt', index: 0 }, name: '', size: 100 }).success).toBe(
      false
    );
  });
});

describe('$PresignedUrlInfo', () => {
  it('should accept an expiry, location and a valid URL', () => {
    expect(
      $PresignedUrlInfo.safeParse({
        exp: 1700000000,
        location: { basename: 'file.txt', index: 0 },
        url: 'https://example.org/file.txt'
      }).success
    ).toBe(true);
  });
  it('should reject an invalid URL', () => {
    expect(
      $PresignedUrlInfo.safeParse({
        exp: 1700000000,
        location: { basename: 'file.txt', index: 0 },
        url: 'not-a-url'
      }).success
    ).toBe(false);
  });
});

describe('$PresignedUrls', () => {
  it('should accept a record of field name to an array of presigned URL info', () => {
    expect(
      $PresignedUrls.safeParse({
        upload: [{ exp: 1700000000, location: { basename: 'file.txt', index: 0 }, url: 'https://example.org/file.txt' }]
      }).success
    ).toBe(true);
  });
});

describe('$UploadCompleteData', () => {
  it('should accept a record of field name to an array of file metadata', () => {
    expect(
      $UploadCompleteData.safeParse({
        uploads: { upload: [{ location: { basename: 'file.txt', index: 0 }, name: 'file.txt', size: 100 }] }
      }).success
    ).toBe(true);
  });
  it('should reject a value missing the uploads field', () => {
    expect($UploadCompleteData.safeParse({}).success).toBe(false);
  });
});
