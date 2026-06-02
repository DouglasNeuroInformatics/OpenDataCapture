const fs = require('node:fs');

const VERSION_TAG_REGEX = /^v(\d+\.\d+\.\d+(-(alpha|beta)\.\d+)?)$/;

const ORG = 'DouglasNeuroinformatics';
const PACKAGES = ['open-data-capture-api', 'open-data-capture-gateway', 'open-data-capture-web'];

/** @typedef {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */

/** @typedef {Awaited<ReturnType<AsyncFunctionArguments['github']['rest']['packages']['getAllPackageVersionsForPackageOwnedByOrg']>>['data'][number]} PackageInfo */

/**
 * Extract the semver release tag (e.g. '1.2.3') for a published package version, or null
 * @param {PackageInfo} packageInfo
 * @returns {null | string}
 */
function extractPackageVersionTag(packageInfo) {
  const tags = packageInfo.metadata?.container?.tags ?? [];
  for (const tag of tags) {
    const match = VERSION_TAG_REGEX.exec(tag)?.[1];
    if (match) {
      return match;
    }
  }
  return null;
}

/**
 * Determine whether the current package.json version differs from the latest published
 * container release, and expose the version + decision as workflow outputs.
 * @param {AsyncFunctionArguments} args
 */
module.exports = async function main({ core, github }) {
  /** @type {string} */
  const currentVersion = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;

  /** @type {string | null | undefined} */
  let resolvedReleaseVersionTag = undefined;

  for (const packageName of PACKAGES) {
    const response = await github.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
      org: ORG,
      package_name: packageName,
      package_type: 'container'
    });
    const latestPackage = response.data.find((item) => item.metadata?.container?.tags?.includes('latest'));
    if (!latestPackage) {
      throw new Error(`Failed to find package '${packageName}' with tag 'latest'`);
    }
    const versionTag = extractPackageVersionTag(latestPackage);
    if (resolvedReleaseVersionTag === undefined) {
      resolvedReleaseVersionTag = versionTag;
    } else if (versionTag !== resolvedReleaseVersionTag) {
      throw new Error(
        `Unexpected version for package '${packageName}': expected '${resolvedReleaseVersionTag}', got '${versionTag}'`
      );
    }
  }

  core.setOutput('version', currentVersion);
  core.setOutput('should_release', String(currentVersion !== resolvedReleaseVersionTag));
};
