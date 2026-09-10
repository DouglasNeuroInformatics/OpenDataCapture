/// <reference types="node" />

import fs from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

const WORKSPACE_NAME_PREFIX = '@opendatacapture/';

const projectRoot = import.meta.dirname;

function readWorkspaceGlobs(): string[] {
  const workspace: unknown = yaml.load(fs.readFileSync(path.join(projectRoot, 'pnpm-workspace.yaml'), 'utf8'));
  if (typeof workspace !== 'object' || workspace === null || !('packages' in workspace)) {
    throw new Error("pnpm-workspace.yaml has no 'packages' field");
  }
  const { packages } = workspace;
  if (!Array.isArray(packages) || !packages.every((glob) => typeof glob === 'string')) {
    throw new Error("pnpm-workspace.yaml 'packages' must be a list of globs");
  }
  return packages;
}

// The vendor wrappers are workspaces too, but their names (react__19.x and the like) are not
// meaningful areas of the codebase, so they are excluded from the scope list on purpose.
function readWorkspaceScopes(): string[] {
  const globs = readWorkspaceGlobs().filter((glob) => !glob.startsWith('vendor/'));
  const manifests = fs.globSync(
    globs.map((glob) => path.posix.join(glob, 'package.json')),
    { cwd: projectRoot }
  );
  const names = manifests.map((manifest) => {
    const { name }: { name?: unknown } = JSON.parse(fs.readFileSync(path.join(projectRoot, manifest), 'utf8'));
    return typeof name === 'string' ? name : '';
  });
  return names
    .filter((name) => name.startsWith(WORKSPACE_NAME_PREFIX))
    .map((name) => name.slice(WORKSPACE_NAME_PREFIX.length))
    .sort();
}

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // A warning while contributors adopt the workspace names as scopes. Raising this to an error
    // is tracked in https://github.com/DouglasNeuroInformatics/OpenDataCapture/issues/1529
    'scope-enum': [1, 'always', readWorkspaceScopes()]
  }
};
