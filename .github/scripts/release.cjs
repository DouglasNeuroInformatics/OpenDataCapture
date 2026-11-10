// @ts-check
const fs = require('node:fs');

// What each field makes the workflow do: .agents/docs/architecture/release-channels.md.
/**
 * @typedef {object} ReleasePlan
 * @property {boolean} edge
 * @property {boolean} latest
 * @property {string} major
 * @property {boolean} release
 * @property {string} version
 */

/** @typedef {readonly [number, number, number]} ParsedVersion */

const RELEASE_BRANCH_PATTERN = /^refs\/heads\/release\/(\d+)$/;
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @param {string} version
 * @returns {ParsedVersion | null}
 */
function parseVersion(version) {
  const match = VERSION_PATTERN.exec(version);
  return match && [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * @param {string} tag
 * @returns {ParsedVersion | null}
 */
function parseTag(tag) {
  return tag.startsWith('v') ? parseVersion(tag.slice(1)) : null;
}

/**
 * A major with a higher major tagged is superseded: it takes fixes only, from its `release/<major>`
 * branch. `scripts/increment-version.ts` asks the same question, so it imports this.
 *
 * @param {number} major
 * @param {readonly string[]} tags
 */
function isSupersededMajor(major, tags) {
  return tags.some((tag) => {
    const parsedTag = parseTag(tag);
    return parsedTag !== null && parsedTag[0] > major;
  });
}

/**
 * @param {ParsedVersion} left
 * @param {ParsedVersion} right
 */
function compareVersions(left, right) {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

/**
 * Decide what a run of the Release workflow publishes.
 *
 * `main` always builds `edge`, and releases only when its version has no `v*` tag yet. A
 * `release/<major>` branch exists only for a superseded major, so it can never move `latest`, and
 * npm, whose trusted publisher trusts `main` alone, skips it.
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
  const major = String(parsedVersion[0]);
  const isMain = ref === 'refs/heads/main';
  const releaseBranch = RELEASE_BRANCH_PATTERN.exec(ref);
  if (!isMain && !releaseBranch) {
    throw new Error(`Releases are cut from refs/heads/main or refs/heads/release/<major>, not ${ref}`);
  }
  const release = !tags.includes(`v${version}`);
  if (releaseBranch) {
    if (releaseBranch[1] !== major) {
      throw new Error(`Version ${version} does not belong on ${ref}`);
    }
    if (!isSupersededMajor(parsedVersion[0], tags)) {
      throw new Error(`No major above ${major} is tagged, so ${major}.x is still released from refs/heads/main`);
    }
    if (!release) {
      throw new Error(`v${version} is already released; bump the version on ${ref} first`);
    }
  }
  const blockingTag = tags.find((tag) => {
    const parsedTag = parseTag(tag);
    return (
      parsedTag !== null &&
      compareVersions(parsedTag, parsedVersion) > 0 &&
      (isMain || parsedTag[0] === parsedVersion[0])
    );
  });
  if (release && blockingTag) {
    throw new Error(`${version} is older than ${blockingTag}; bump past it first`);
  }
  return { edge: isMain, latest: isMain && release, major, release, version };
}

/**
 * Expose the release plan as workflow outputs.
 *
 * The dispatched ref supplies this file too, so the ref check here stops accidents only. The
 * `release` environment's branch policy and the npm trusted publisher are what enforce it.
 *
 * @param {{
 *   context: { ref: string };
 *   core: { notice: (message: string) => void; setOutput: (name: string, value: string) => void };
 *   exec: { getExecOutput: (command: string, args: string[]) => Promise<{ stdout: string }> };
 * }} args
 */
module.exports = async ({ context, core, exec }) => {
  /** @type {string} */
  const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
  const { stdout } = await exec.getExecOutput('git', ['tag', '--list', 'v*']);
  const plan = planRelease({ ref: context.ref, tags: stdout.split('\n').filter(Boolean), version });
  if (plan.release && !plan.latest) {
    core.notice(
      `Skipping npm: ${version} releases the superseded ${plan.major} line, and npm publishes from main only`
    );
  }
  for (const [name, value] of Object.entries(plan)) {
    core.setOutput(name, String(value));
  }
};

module.exports.isSupersededMajor = isSupersededMajor;
module.exports.parseVersion = parseVersion;
module.exports.planRelease = planRelease;
