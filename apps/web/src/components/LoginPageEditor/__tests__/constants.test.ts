import { LOGIN_THEMES, PANEL_SECTIONS } from '@opendatacapture/schemas/setup';
import { describe, expect, it } from 'vitest';

import {
  ACCEPTED_LOGO_MIME_TYPES,
  DEFAULT_PANEL_TEXT_COLOR,
  DEFAULT_SECTIONS_ORDER,
  HEX_PATTERN,
  RIGHT_PANEL_LABELS,
  RIGHT_PANEL_OPTIONS,
  THEME_LABELS,
  URL_PATTERN
} from '../constants';

describe('LoginPageEditor constants', () => {
  it.each(['#abc', '#ABCDEF', '#0ea5e9'])('should accept the hex color %s', (color) => {
    expect(HEX_PATTERN.test(color)).toBe(true);
  });

  it.each(['abc', '#ab', '#abcd', '#gggggg', '#0ea5e9 '])('should reject the malformed hex color %s', (color) => {
    expect(HEX_PATTERN.test(color)).toBe(false);
  });

  it.each(['https://example.com', 'http://example.com/path?q=1'])('should accept the http url %s', (url) => {
    expect(URL_PATTERN.test(url)).toBe(true);
  });

  it.each(['javascript:alert(1)', 'https://localhost', 'ftp://example.com', 'https://exa mple.com'])(
    'should reject %s, since it is not an http url with a dotted host',
    (url) => {
      expect(URL_PATTERN.test(url)).toBe(false);
    }
  );

  it('should seed the panel text picker with a valid hex color', () => {
    expect(HEX_PATTERN.test(DEFAULT_PANEL_TEXT_COLOR)).toBe(true);
  });

  it('should order every panel section exactly once by default', () => {
    expect([...DEFAULT_SECTIONS_ORDER].sort()).toEqual([...PANEL_SECTIONS].sort());
  });

  it('should offer the default right panel and every theme but sunset, so the swatch grid stays 2 by 4', () => {
    expect([...RIGHT_PANEL_OPTIONS].sort()).toEqual(['none', ...LOGIN_THEMES.filter((t) => t !== 'sunset')].sort());
  });

  it('should label every right panel option and every theme', () => {
    expect(Object.keys(RIGHT_PANEL_LABELS).sort()).toEqual([...RIGHT_PANEL_OPTIONS].sort());
    expect(Object.keys(THEME_LABELS).sort()).toEqual([...LOGIN_THEMES].sort());
  });

  it('should accept only image types', () => {
    expect(ACCEPTED_LOGO_MIME_TYPES.every((type) => type.startsWith('image/'))).toBe(true);
  });
});
