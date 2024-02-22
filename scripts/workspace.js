#!/usr/bin/env node

import cp from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import yaml from 'js-yaml';

const PROJECT_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const WORKSPACE_DIRS = await fs
  .readFile(path.resolve(PROJECT_ROOT, 'pnpm-workspace.yaml'), 'utf-8')
  .then((content) => /** @type {{ packages: string[] }} */ /** @type {{ packages: string[] }} */ (yaml.load(content)))
  .then(({ packages }) => packages.map((ws) => ws.split('/')[0]));

const [targetWorkspace, ...args] = process.argv.slice(2, process.argv.length);

if (!targetWorkspace || args.length === 0) {
  console.log(`Usage: ${process.argv[1]} <workspace> <command> [command-args ...]`);
  process.exit(1);
}

let isFound = false;
for (const dir of WORKSPACE_DIRS) {
  for (const workspace of await fs.readdir(path.resolve(PROJECT_ROOT, dir))) {
    const workspaceDir = path.resolve(PROJECT_ROOT, dir, workspace);
    const stats = await fs.lstat(workspaceDir);
    if (!stats.isDirectory()) {
      continue;
    }
    const workspaceName = await fs
      .readFile(path.resolve(workspaceDir, 'package.json'), 'utf-8')
      .then(JSON.parse)
      .then((pkg) => pkg.name.replace('@open-data-capture/', ''));
    if (workspaceName === targetWorkspace) {
      isFound = true;
      try {
        const val = cp.execSync(`pnpm run ${args.join(' ')}`, {
          cwd: workspaceDir,
          stdio: 'inherit'
        });
        console.log(val);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw err;
        }
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
