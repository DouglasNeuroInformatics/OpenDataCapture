import * as fs from 'node:fs';

import type { FullConfig } from '@playwright/test';

import { AUTH_STORAGE_DIR } from '../helpers/constants';

export default function setup(_config: FullConfig) {
  if (!fs.existsSync(AUTH_STORAGE_DIR)) {
    fs.mkdirSync(AUTH_STORAGE_DIR, { recursive: true });
  }
}
