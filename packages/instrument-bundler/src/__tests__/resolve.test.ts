import { describe, expect, it } from 'vitest';

import { resolveIndexInput, resolveInput } from '../resolve.js';

describe('resolveIndexInput', () => {
  it('should throw if provided an empty array of inputs', () => {
    expect(() => resolveIndexInput([])).toThrowError('Failed to resolve index file from empty array');
  });
  it('should throw if there is no valid index in the provided inputs', () => {
    expect(() => {
      resolveIndexInput([
        {
          content: '',
          name: 'foo.js'
        },
        {
          content: '',
          name: 'index.css'
        },
        {
          content: '',
          name: 'index'
        }
      ]);
    }).toThrowError("Failed to resolve index file from input filenames: 'foo.js', 'index.css', 'index'");
  });
  it('should return the correct index', () => {
    const inputs = [
      {
        content: '',
        name: 'index.js'
      },
      {
        content: '',
        name: 'index.ts'
      }
    ];
    expect(resolveIndexInput(inputs)).toBe(inputs[1]);
  });
});

describe('resolveInput', () => {
  it("should throw if the path does not begin with './'", () => {
    expect(() => resolveInput('foo.js', [])).toThrowError('Invalid path');
    expect(() => resolveInput('/foo.js', [])).toThrowError('Invalid path');
  });
  it('should throw if the path is more than one level deep', () => {
    expect(() => resolveInput('./foo/foo.js', [])).toThrowError('Invalid path');
  });
  it('should return null if the input does not exist', () => {
    expect(resolveInput('./foo.js', [{ content: '', name: 'bar.js' }])).toBeNull();
  });
  it('should return the input if it does exist', () => {
    expect(
      resolveInput('./foo.js', [
        { content: '', name: 'bar.js' },
        { content: '', name: 'foo.js' },
        { content: '', name: 'foo.ts' }
      ])
    ).toMatchObject({
      name: 'foo.js'
    });
  });
});
