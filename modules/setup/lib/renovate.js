import { consoleError, consoleInfo, consoleSuccess } from 'firost';
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
    const renovateDashboardUrl = `https://developer.mend.io/github/${username}/${repo}`;

    // Fail early if no token available
    if (!githubHelper.hasToken()) {
      this.__consoleError(
        'Renovate: ABERLAAS_GITHUB_TOKEN environment variable must be set',
      );
      this.__consoleInfo("  Create a Classic token with 'repo' scope");
      this.__consoleInfo('  https://github.com/settings/tokens\n');
      return false;
    }

    // Check if already enabled
    if (await this.isAlreadyEnabled()) {
      this.__consoleSuccess('Renovate: Already configured');
      this.__consoleInfo(`  ${renovateDashboardUrl}\n`);
      return true;
    }

    try {
      const repositoryId = await this.getRepositoryId();
      await githubHelper.octokit('apps.addRepoToInstallation', {
        installation_id: this.renovateId,
        repository_id: repositoryId,
      });
    } catch (_err) {
      this.__consoleError('Renovate is not installed with this GitHub account');
      this.__consoleInfo(
        '  Please visit the installation page to install it first',
      );
      this.__consoleInfo(`  ${manualUrl}\n`);
      return false;
    }

    this.__consoleSuccess('Renovate: Repository configured');
    this.__consoleInfo(`  ${renovateDashboardUrl}\n`);
    return true;
  },
  /**
   * Check if Renovate is already enabled for this repository
   * @returns {boolean} True if already enabled, false otherwise
   */
  async isAlreadyEnabled() {
    try {
      const { username, repo } = await githubHelper.repoData();
      const installations = await githubHelper.octokit(
        'apps.listReposAccessibleToInstallation',
        {
          installation_id: this.renovateId,
        },
      );

      return installations.repositories.some(
        (repoData) =>
          repoData.owner.login === username && repoData.name === repo,
      );
    } catch {
      // API call fails if Renovate app is not installed - treat as not enabled
      return false;
    }
  },
  __consoleSuccess: consoleSuccess,
  __consoleInfo: consoleInfo,
  __consoleError: consoleError,
};
