// @ts-check
const fs = require('node:fs');

/**
 * @typedef {object} ReleasePlan
 * @property {string} channel `<major>.<minor>` — the moving image tag of this release line
 * @property {boolean} edge whether to push the `edge` and `sha-<short>` image tags
 * @property {boolean} latest whether this release moves `latest` on GHCR, npm and GitHub
 * @property {string} npmTag the npm dist-tag the packages publish under
 * @property {boolean} release whether `v<version>` is untagged, so this run publishes it
 * @property {string} version the root `package.json` version
 */

const RELEASE_BRANCH_PATTERN = /^refs\/heads\/release\/(\d+)\.(\d+)$/;
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

/** @param {string} version */
function parseVersion(version) {
  const match = VERSION_PATTERN.exec(version);
  return match && /** @type {const} */ ([Number(match[1]), Number(match[2]), Number(match[3])]);
}

/**
 * @param {readonly [number, number, number]} left
 * @param {readonly [number, number, number]} right
 */
function compareVersions(left, right) {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

/**
 * Decide what a run of the Release workflow publishes.
 *
 * `main` always builds `edge`; it releases only when its version has no `v*` tag yet. A
 * `release/<major>.<minor>` branch builds nothing else, so a dispatch there without a fresh bump is
 * a mistake and fails. `latest` follows the highest released version, whichever branch cut it.
 *
 * The decision reads only the repository — the version file and the git tags — never a registry: a
 * deleted image or package must not be able to wedge the next release. It is only as fresh as the
 * tag snapshot, which is why `release.yaml` runs one Release at a time across every ref.
 *
 * @param {{ ref: string; tags: readonly string[]; version: string }} input
 * @returns {ReleasePlan}
 */
function planRelease({ ref, tags, version }) {
  const parsedVersion = parseVersion(version);
  if (!parsedVersion) {
    throw new Error(`The root package.json version '${version}' is not <major>.<minor>.<patch>`);
  }
  const channel = `${parsedVersion[0]}.${parsedVersion[1]}`;
  const isMain = ref === 'refs/heads/main';
  const releaseBranch = RELEASE_BRANCH_PATTERN.exec(ref);
  if (!isMain && !releaseBranch) {
    throw new Error(`Releases are cut from refs/heads/main or refs/heads/release/<major>.<minor>, not ${ref}`);
  }
  if (releaseBranch && `${releaseBranch[1]}.${releaseBranch[2]}` !== channel) {
    throw new Error(`Version ${version} does not belong on ${ref}`);
  }
  const release = !tags.includes(`v${version}`);
  if (releaseBranch && !release) {
    throw new Error(`v${version} is already released; bump the version on ${ref} first`);
  }
  const newerTags = tags.filter((tag) => {
    const parsedTag = parseVersion(tag.slice(1));
    return parsedTag && compareVersions(parsedTag, parsedVersion) > 0;
  });
  const newerTagOnLine = newerTags.find((tag) => tag.startsWith(`v${channel}.`));
  if (release && newerTagOnLine) {
    throw new Error(`${version} is older than ${newerTagOnLine} on the ${channel} line; bump past it first`);
  }
  const latest = release && newerTags.length === 0;
  return {
    channel,
    edge: isMain,
    latest,
    npmTag: latest ? 'latest' : `release-${channel}`,
    release,
    version
  };
}

/**
 * Expose the release plan as workflow outputs.
 *
 * The dispatched ref supplies this file too, so the ref check here stops accidents only. The
 * `release` environment's branch policy and the npm trusted publisher are what enforce it.
 *
 * @param {{
 *   context: { ref: string };
 *   core: { setOutput: (name: string, value: string) => void };
 *   exec: { getExecOutput: (command: string, args: string[]) => Promise<{ stdout: string }> };
 * }} args
 */
module.exports = async ({ context, core, exec }) => {
  /** @type {string} */
  const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
  const { stdout } = await exec.getExecOutput('git', ['tag', '--list', 'v*']);
  const plan = planRelease({ ref: context.ref, tags: stdout.split('\n').filter(Boolean), version });
  for (const [name, value] of Object.entries(plan)) {
    core.setOutput(name, String(value));
  }
};

module.exports.planRelease = planRelease;
