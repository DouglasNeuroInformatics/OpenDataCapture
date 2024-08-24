import { describe, expect, it } from 'vitest';

import { extractInputFileExtension, inferLoader, isHttpImport } from '../utils.js';

describe('extractInputFileExtension', () => {
  it('should extract a .css extension', () => {
    expect(extractInputFileExtension('styles.css')).toBe('.css');
  });

  it('should extract a .html extension', () => {
    expect(extractInputFileExtension('index.html')).toBe('.html');
  });

  it('should extract a .jpeg extension', () => {
    expect(extractInputFileExtension('image.jpeg')).toBe('.jpeg');
  });

  it('should return null for unsupported extensions', () => {
    expect(extractInputFileExtension('document.pdf')).toBeNull();
  });

  it('should return null for filenames without extensions', () => {
    expect(extractInputFileExtension('filename')).toBeNull();
  });
});

describe('inferLoader', () => {
  it('should infer css loader for css', () => {
    expect(inferLoader('styles.css')).toBe('css');
  });

  it('should infer text loader for html', () => {
    expect(inferLoader('index.html')).toBe('text');
  });

  it('should infer js loader for js', () => {
    expect(inferLoader('script.js')).toBe('js');
  });

  it('should infer jsx loader for jsx', () => {
    expect(inferLoader('component.jsx')).toBe('jsx');
  });

  it('should infer ts loader for ts', () => {
    expect(inferLoader('module.ts')).toBe('ts');
  });

  it('should infer tsx loader for tsx', () => {
    expect(inferLoader('component.tsx')).toBe('tsx');
  });

  it('should infer dataurl loader for image files', () => {
    expect(inferLoader('image.jpeg')).toBe('dataurl');
    expect(inferLoader('image.jpg')).toBe('dataurl');
    expect(inferLoader('image.png')).toBe('dataurl');
    expect(inferLoader('image.svg')).toBe('dataurl');
    expect(inferLoader('image.webp')).toBe('dataurl');
  });

  it('should throw an error for unsupported extensions', () => {
    expect(() => inferLoader('document.pdf')).toThrowError(
      'Cannot infer loader due to unexpected extension for filename: document.pdf'
    );
  });
});

describe('isHttpImport', () => {
  it('should return true for paths starting with /', () => {
    expect(isHttpImport('/path/to/resource')).toBe(true);
  });

  it('should return true for paths starting with http://', () => {
    expect(isHttpImport('http://example.com/resource')).toBe(true);
  });

  it('should return true for paths starting with https://', () => {
    expect(isHttpImport('https://example.com/resource')).toBe(true);
  });

  it('should return false for module imports', () => {
    expect(isHttpImport('react')).toBe(false);
    expect(isHttpImport('react/jsx-runtime')).toBe(false);
  });

  it('should return false for relative paths', () => {
    expect(isHttpImport('./relative/path/to/resource')).toBe(false);
  });

  it('should return false for other protocols', () => {
    expect(isHttpImport('ftp://example.com/resource')).toBe(false);
  });
});
