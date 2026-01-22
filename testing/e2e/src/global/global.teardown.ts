import * as fs from 'node:fs';

import { AUTH_STORAGE_DIR } from '../helpers/constants';

export default function teardown() {
  if (fs.existsSync(AUTH_STORAGE_DIR)) {
    fs.rmSync(AUTH_STORAGE_DIR, { force: true, recursive: true });
  }
}
