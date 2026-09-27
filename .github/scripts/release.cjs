const fs = require('node:fs');

/**
 * Expose the release version and the decision to release as workflow outputs.
 *
 * Every push to `main` releases. This deliberately consults nothing outside the repository:
 * the previous implementation asked GHCR which version carried the `latest` tag, which never
 * skipped a release (`build` pushes bare tags, and it only matched `v`-prefixed ones) but did
 * fail the whole workflow once a bad release was deleted and took the `latest` tag with it.
 *
 * A manual dispatch is refused on any other ref, so a branch cannot publish `latest`, npm packages
 * or a `v*` tag. This only stops an accidental dispatch: the dispatched ref supplies this file too.
 * The `release` environment's branch policy and the npm trusted publisher are what enforce it.
 *
 * @param {import('github-script').AsyncFunctionArguments} args
 */
module.exports = ({ context, core }) => {
  if (context.ref !== 'refs/heads/main') {
    core.setFailed(`Releases are cut from refs/heads/main only, not ${context.ref}`);
    return;
  }
  /** @type {string} */
  const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
  core.setOutput('version', version);
  core.setOutput('should_release', 'true');
};
