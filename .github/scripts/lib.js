// @ts-check

const PACKAGE_NAMES = ['open-data-capture-api', 'open-data-capture-gateway', 'open-data-capture-web'];
const VERSION_TAG_REGEX = /v([0-9]+.[0-9]+.[0-9]+)/;

/**
 * Get the latest published container version from GitHub. If the latest version is not the same
 * for all packages, throws an exception.
 *
 * @param {Pick<import('github-script').AsyncFunctionArguments, "github">} args
 * @returns {Promise<string>}
 */
export async function getLatestPublishedVersion({ github }) {
  /** @type {string} */
  let packageVersion;
  for (const packageName of PACKAGE_NAMES) {
    const packages = await github.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
      org: 'DouglasNeuroinformatics',
      package_name: 'open-data-capture-api',
      package_type: 'container'
    });
    const latestPackage = packages.data.find((item) => item.metadata.container.tags.includes('latest'));
    if (!latestPackage) {
      console.error(JSON.stringify({ packages }, null, 2));
      throw new Error(`Failed to find release with 'latest' tag for package '${packageName}'`);
    }
    const tags = latestPackage.metadata.container.tags;
    const latestTag = tags.find((tag) => VERSION_TAG_REGEX.test(tag));
    if (!latestTag) {
      throw new Error(`Failed to find valid version tag in array: ${tags}`);
    }
    const latestVersion = VERSION_TAG_REGEX.exec(latestTag)[1];
    if (!packageVersion) {
      packageVersion = latestVersion;
    } else if (packageVersion !== latestVersion) {
      throw new Error(
        `Unexpected version for package '${packageName}': expected '${packageVersion}', got '${latestVersion}'`
      );
    }
  }
  console.log(`Found latest published version: ${packageVersion}`);
  return packageVersion;
}
