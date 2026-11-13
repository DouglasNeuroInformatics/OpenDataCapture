// What each field makes the workflow do: .agents/docs/architecture/release-channels.md.
type ReleasePlan = {
  edge: boolean;
  latest: boolean;
  major: string;
  release: boolean;
  version: string;
};

type ParsedVersion = readonly [number, number, number];

type ReleaseState = {
  ref: string;
  tags: readonly string[];
  version: string;
};

type ReleaseRun = {
  ref: string;
  tagList: string;
  version: string;
};

type ReleaseOutputs = {
  githubOutput: string;
  notice: null | string;
};

const RELEASE_BRANCH_PATTERN = /^refs\/heads\/release\/(\d+)$/;
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

function parseVersion(version: string): null | ParsedVersion {
  const match = VERSION_PATTERN.exec(version);
  return match && [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseTag(tag: string): null | ParsedVersion {
  return tag.startsWith('v') ? parseVersion(tag.slice(1)) : null;
}

// A major with a higher major tagged is superseded: it takes fixes only, from its `release/<major>`
// branch. `scripts/increment-version.ts` asks the same question, so it imports this.
function isSupersededMajor(major: number, tags: readonly string[]): boolean {
  return tags.some((tag) => {
    const parsedTag = parseTag(tag);
    return parsedTag !== null && parsedTag[0] > major;
  });
}

function compareVersions(left: ParsedVersion, right: ParsedVersion): number {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

// `main` always builds `edge`, and releases only when its version has no `v*` tag yet. A
// `release/<major>` branch exists only for a superseded major, so it can never move `latest`, and
// npm, whose trusted publisher trusts `main` alone, skips it.
//
// The decision reads only the repository — the version file and the git tags — never a registry: a
// deleted image or package must not be able to wedge the next release. It is only as fresh as the
// tag snapshot, which is why `release.yaml` runs one Release at a time across every ref.
function planRelease({ ref, tags, version }: ReleaseState): ReleasePlan {
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

// The dispatched ref supplies this file too, so the ref check in `planRelease` stops accidents only. The
// `release` environment's branch policy and the npm trusted publisher are what enforce it.
function planReleaseOutputs({ ref, tagList, version }: ReleaseRun): ReleaseOutputs {
  const plan = planRelease({ ref, tags: tagList.split('\n').filter(Boolean), version });
  return {
    githubOutput: Object.entries(plan)
      .map(([name, value]) => `${name}=${String(value)}\n`)
      .join(''),
    notice:
      plan.release && !plan.latest
        ? `Skipping npm: ${version} releases the superseded ${plan.major} line, and npm publishes from main only`
        : null
  };
}

export { isSupersededMajor, parseVersion, planRelease, planReleaseOutputs };
