import { describe, expect, it, vi } from 'vitest';

import publishNpm from '../publish-npm.cjs';

type Registry = { [spec: string]: string };

function createExec(registry: Registry, publishable = '@odc/a\t2.5.3\t/a/package.json\n') {
  return {
    exec: vi.fn(() => Promise.resolve(0)),
    getExecOutput: vi.fn((command: string, args: string[]) => {
      if (command === 'scripts/list-publishable.sh') {
        return Promise.resolve({ exitCode: 0, stdout: publishable });
      }
      const value = registry[`${args[1]} ${args[2]}`];
      return Promise.resolve(value === undefined ? { exitCode: 1, stdout: '' } : { exitCode: 0, stdout: `${value}\n` });
    })
  };
}

describe('publishNpm', () => {
  it('should refuse a malformed publishable row rather than publish a guessed name', async () => {
    const exec = createExec({}, '@odc/a 2.5.3\n');
    await expect(publishNpm({ core: { info: vi.fn() }, exec, npmTag: 'latest' })).rejects.toThrow(
      "scripts/list-publishable.sh printed a row that is not <name>\t<version>\t<path>: '@odc/a 2.5.3'"
    );
  });

  it('should publish an unpublished version under the planned dist-tag', async () => {
    const exec = createExec({});
    await publishNpm({ core: { info: vi.fn() }, exec, npmTag: 'release-2.5' });
    expect(exec.exec).toHaveBeenCalledWith('pnpm', [
      '--filter',
      '@odc/a',
      'publish',
      '--no-git-checks',
      '--tag',
      'release-2.5'
    ]);
  });

  it('should skip a published version whose planned dist-tag already points at it, so a re-run is safe', async () => {
    const exec = createExec({ '@odc/a@2.5.3 version': '2.5.3', '@odc/a dist-tags.latest': '2.5.3' });
    const info = vi.fn();
    await publishNpm({ core: { info }, exec, npmTag: 'latest' });
    expect(exec.exec).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith('Skipping @odc/a@2.5.3 (already published)');
  });

  it('should fail a re-run whose planned dist-tag is elsewhere, so the channel is never left behind silently', async () => {
    const exec = createExec({ '@odc/a@2.5.3 version': '2.5.3', '@odc/a dist-tags.release-2.5': '2.5.2' });
    await expect(publishNpm({ core: { info: vi.fn() }, exec, npmTag: 'release-2.5' })).rejects.toThrow(
      "@odc/a@2.5.3 is already published, but its release-2.5 dist-tag is on '2.5.2'; trusted publishing cannot move a dist-tag, so cut a fresh patch"
    );
    expect(exec.exec).not.toHaveBeenCalled();
  });
});
