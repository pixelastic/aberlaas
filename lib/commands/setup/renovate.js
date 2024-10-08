import { consoleError, consoleSuccess } from 'firost';
import githubHelper from './helpers/github.js';

export default {
  renovateId: 2471197,
  /**
   * Returns the GitHub repository Id
   * @returns {number} Repository Id
   */
  async getRepositoryId() {
    const { username, repo } = await githubHelper.repoData();
    const { id } = await githubHelper.octokit('repos.get', {
      owner: username,
      repo,
    });
    return id;
  },
  /**
   * Attempt to automatically add the current repo to renovate, otherwise
   * display the link to do it manually
   * @returns {boolean} True if enabled, false otherwise
   */
  async enable() {
    const { username, repo } = await githubHelper.repoData();
    const manualUrl = `https://github.com/settings/installations/${this.renovateId}`;
    const renovateDashboardUrl = `https://app.renovatebot.com/dashboard#github/${username}/${repo}`;

    // Fail early if no token available
    if (!githubHelper.hasToken()) {
      this.__consoleError(
        `[renovate]: No GITHUB_TOKEN found, please visit ${manualUrl} to enable manually.`,
      );
      return false;
    }

    try {
      const repositoryId = await this.getRepositoryId();
      await githubHelper.octokit('apps.addRepoToInstallation', {
        installation_id: this.renovateId,
        repository_id: repositoryId,
      });
    } catch (_err) {
      this.__consoleError(
        `Renovate is not installed with this GitHub account, please visit ${manualUrl} to install it first.`,
      );
      return false;
    }

    this.__consoleSuccess(`Renovate enabled: ${renovateDashboardUrl}`);
    return true;
  },
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
