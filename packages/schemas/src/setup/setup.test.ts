import { describe, expect, it } from 'vitest';

import { $BrandingConfig } from './setup.js';

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
