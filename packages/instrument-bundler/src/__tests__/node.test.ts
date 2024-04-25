import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadDirectory } from '../node.js';

describe('loadDirectory', () => {
  it('should throw an error if the provided directory does not exist', async () => {
    await expect(loadDirectory(path.resolve(import.meta.dirname, 'foo'))).rejects.toThrowError(
      'Directory does not exist'
    );
  });
  it('should throw an error if the provided directory is a file', async () => {
    await expect(loadDirectory(import.meta.filename)).rejects.toThrowError('Not a directory');
  });
  it('should return the inputs contained in the form repository', async () => {
    await expect(loadDirectory(path.resolve(import.meta.dirname, 'repositories/form'))).resolves.toMatchObject([
      {
        content: expect.any(String),
        name: 'index.ts'
      }
    ]);
  });
  it('should return the inputs contained in the interactive repository', async () => {
    await expect(loadDirectory(path.resolve(import.meta.dirname, 'repositories/interactive'))).resolves.toMatchObject([
      {
        content: expect.any(String),
        name: 'index.ts'
      },
      {
        content: expect.any(String),
        name: 'styles.css'
      }
    ]);
  });
});
