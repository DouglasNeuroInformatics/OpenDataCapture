// @ts-check

/** @param {import('github-script').AsyncFunctionArguments} args */
export async function getLatestVersion({ github }) {
  const result = await github.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser();
  console.log(result);
}
