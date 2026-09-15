const fs = require('node:fs');

/**
 * Expose the release version and the decision to release as workflow outputs.
 *
 * Every push to `main` releases. This deliberately consults nothing outside the repository:
 * the previous implementation asked GHCR which version carried the `latest` tag, which never
 * skipped a release (`build` pushes bare tags, and it only matched `v`-prefixed ones) but did
 * fail the whole workflow once a bad release was deleted and took the `latest` tag with it.
 *
 * @param {import('github-script').AsyncFunctionArguments} args
 */
module.exports = ({ core }) => {
  /** @type {string} */
  const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
  core.setOutput('version', version);
  core.setOutput('should_release', 'true');
};
