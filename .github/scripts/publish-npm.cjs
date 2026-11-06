// @ts-check

/**
 * @typedef {object} Exec
 * @property {(command: string, args: string[]) => Promise<number>} exec
 * @property {(
 *   command: string,
 *   args: string[],
 *   options: { ignoreReturnCode?: boolean; silent: boolean }
 * ) => Promise<{ exitCode: number; stdout: string }>} getExecOutput
 */

const PUBLISHABLE_ROW_PATTERN = /^(\S+)\t(\S+)\t/;

/**
 * @param {Exec} exec
 * @param {string} spec
 * @param {string} field
 */
async function npmView(exec, spec, field) {
  const { exitCode, stdout } = await exec.getExecOutput('npm', ['view', spec, field], {
    ignoreReturnCode: true,
    silent: true
  });
  return exitCode === 0 ? stdout.trim() : '';
}

/**
 * Publish every publishable package whose version npm does not carry yet, under `npmTag`.
 *
 * A version npm already carries is skipped, which keeps a re-run safe — but only while its `npmTag`
 * still points at it. A re-run planned after a newer release can carry another `npmTag`, and trusted
 * publishing cannot move a dist-tag, so that case fails rather than finishing green with the
 * channel left behind.
 *
 * @param {{ core: { info: (message: string) => void }; exec: Exec; npmTag: string }} args
 */
module.exports = async ({ core, exec, npmTag }) => {
  const { stdout } = await exec.getExecOutput('scripts/list-publishable.sh', [], { silent: true });
  for (const row of stdout.split('\n').filter(Boolean)) {
    const match = PUBLISHABLE_ROW_PATTERN.exec(row);
    if (!match) {
      throw new Error(`scripts/list-publishable.sh printed a row that is not <name>\t<version>\t<path>: '${row}'`);
    }
    const [name, version] = [String(match[1]), String(match[2])];
    if (!(await npmView(exec, `${name}@${version}`, 'version'))) {
      core.info(`Publishing ${name}@${version} under ${npmTag}`);
      await exec.exec('pnpm', ['--filter', name, 'publish', '--no-git-checks', '--tag', npmTag]);
      continue;
    }
    const taggedVersion = await npmView(exec, name, `dist-tags.${npmTag}`);
    if (taggedVersion !== version) {
      throw new Error(
        `${name}@${version} is already published, but its ${npmTag} dist-tag is on '${taggedVersion}'; trusted publishing cannot move a dist-tag, so cut a fresh patch`
      );
    }
    core.info(`Skipping ${name}@${version} (already published)`);
  }
};
