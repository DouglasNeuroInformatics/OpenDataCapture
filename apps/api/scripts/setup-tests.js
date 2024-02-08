import fs from 'fs/promises';
import path from 'path';

process.env.NODE_ENV = 'testing';

// Set env variables from .env file in root
await fs
  .readFile(path.resolve(import.meta.dir, '../../../.env'), 'utf-8')
  .then((text) => text.split('\n'))
  .then((lines) => lines.filter((line) => line && !line.startsWith('#')))
  .then((lines) => lines.map((line) => line.split('=').map((s) => s.trim())))
  .then((entries) => {
    entries.forEach(([key, value]) => {
      process.env[key] = value;
    });
  });
