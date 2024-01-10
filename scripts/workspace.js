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

let isFound = false;
for (const dir of WORKSPACE_DIRS) {
  for (const workspace of await fs.readdir(path.resolve(PROJECT_ROOT, dir))) {
    const workspaceDir = path.resolve(PROJECT_ROOT, dir, workspace);
    const workspaceName = await fs
      .readFile(path.resolve(workspaceDir, 'package.json'), 'utf-8')
      .then(JSON.parse)
      .then((pkg) => pkg.name.replace('@open-data-capture/', ''));
    if (workspaceName === targetWorkspace) {
      isFound = true;
      try {
        const val = cp.execSync(`bun run ${args.join(' ')}`, {
          cwd: workspaceDir,
          stdio: 'inherit'
        });
        console.log(val);
      } catch (err) {
        console.error(`\n${err.message}`);
      }
    }
  }
}

if (!isFound) {
  console.error(`Failed to find workspace: ${targetWorkspace}`);
  process.exit(1);
}

process.exit(0);
