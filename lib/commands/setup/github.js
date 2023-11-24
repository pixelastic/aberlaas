const githubHelper = require('./helpers/github.js');
const consoleSuccess = require('firost/consoleSuccess');
const consoleError = require('firost/consoleError');
module.exports = {
  /**
   * Configure the GitHub repo with default settings:
   * - Do not enable merge commits on PR
   * - Automatically delete branches after PR merge
   * @returns {boolean} True if enabled, false otherwise
   **/
  async enable() {
    const { username, repo } = await githubHelper.repoData();
    const repoUrl = `https://github.com/${username}/${repo}`;
    const manualUrl = `${repoUrl}/settings`;

    // Fail early if no token available
    if (!githubHelper.hasToken()) {
      this.__consoleError(
        `[github]: No GITHUB_TOKEN found, please visit ${manualUrl} to configure manually.`,
      );
      return false;
    }

    const settings = {
      allow_merge_commit: false,
      allow_rebase_merge: true,
      allow_squash_merge: true,
      delete_branch_on_merge: true,
    };

    await githubHelper.octokit('repos.update', {
      owner: username,
      repo,
      ...settings,
    });

    this.__consoleSuccess(`GitHub repo configured: ${repoUrl}`);
    return true;
  },
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
