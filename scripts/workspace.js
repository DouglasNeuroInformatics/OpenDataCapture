#!/usr/bin/env node

import cp from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const PROJECT_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const WORKSPACE_DIRS = await fs
  .readFile(path.resolve(PROJECT_ROOT, 'package.json'), 'utf-8')
  .then(JSON.parse)
  .then((pkg) => pkg.workspaces.map((ws) => ws.split('/')[0]));

const [targetWorkspace, ...args] = process.argv.slice(2, process.argv.length);

if (!targetWorkspace || args.length === 0) {
  console.log(`Usage: ${process.argv[1]} <workspace> <command> [command-args ...]`);
  process.exit(1);
}

for (const dir of WORKSPACE_DIRS) {
  for (const workspace of await fs.readdir(path.resolve(PROJECT_ROOT, dir))) {
    if (workspace === targetWorkspace) {
      cp.execSync(args.join(' '), {
        cwd: path.resolve(PROJECT_ROOT, dir, workspace),
        stdio: 'inherit'
      });
    }
  }
}

process.exit(0);
