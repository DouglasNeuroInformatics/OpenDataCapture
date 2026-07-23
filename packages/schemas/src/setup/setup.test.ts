import { describe, expect, it } from 'vitest';

import { $BrandingConfig, $UpdateSetupStateData } from './setup.js';

describe('$BrandingConfig', () => {
  describe('customLogoSrc', () => {
    it.each([
      ['data:image/png;base64,iVBORw0KGgo='],
      ['data:image/jpeg;base64,/9j/4AAQSkZJRg=='],
      ['data:image/svg+xml;base64,PHN2Zy8+'],
      ['data:image/webp;base64,UklGRg=='],
      // Uploaded by an earlier version, before the editor narrowed the accepted types
      ['data:image/gif;base64,R0lGODlh']
    ])('should accept the image data URI %s', (customLogoSrc) => {
      expect($BrandingConfig.safeParse({ customLogoSrc }).success).toBe(true);
    });

    it('should accept an http(s) URL, as saved before customLogoUrl existed', () => {
      expect($BrandingConfig.safeParse({ customLogoSrc: 'https://example.org/logo.png' }).success).toBe(true);
    });

    it.each([
      ['javascript:alert(1)'],
      ['data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='],
      ['data:application/javascript;base64,YWxlcnQoMSk='],
      ['vbscript:msgbox(1)'],
      ['not-a-url-at-all']
    ])('should reject the non-image value %s', (customLogoSrc) => {
      expect($BrandingConfig.safeParse({ customLogoSrc }).success).toBe(false);
    });
  });

  describe('customLogoUrl', () => {
    it('should accept an http(s) URL', () => {
      expect($BrandingConfig.safeParse({ customLogoUrl: 'https://example.org/logo.png' }).success).toBe(true);
    });

    it.each([['javascript:alert(1)'], ['data:text/html;base64,PHNjcmlwdD4=']])(
      'should reject the non-http(s) URL %s',
      (customLogoUrl) => {
        expect($BrandingConfig.safeParse({ customLogoUrl }).success).toBe(false);
      }
    );
  });
});

describe('$UpdateSetupStateData', () => {
  describe('defaultAssignmentDurationDays', () => {
    it.each([1, 30, 365, 3650])('should accept the positive whole day count %d', (value) => {
      expect($UpdateSetupStateData.safeParse({ defaultAssignmentDurationDays: value }).success).toBe(true);
    });

    it.each([0, -1, 1.5, 3651])('should reject the out-of-range or non-integer value %d', (value) => {
      expect($UpdateSetupStateData.safeParse({ defaultAssignmentDurationDays: value }).success).toBe(false);
    });

    it('should allow the field to be omitted', () => {
      expect($UpdateSetupStateData.safeParse({}).success).toBe(true);
    });
  });
});
