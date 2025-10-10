import { consoleError, consoleInfo, consoleSuccess } from 'firost';
import { _ } from 'golgoth';
import githubHelper from './helpers/github.js';

const gitHubSettings = {
  allow_merge_commit: false,
  allow_rebase_merge: true,
  allow_squash_merge: true,
  delete_branch_on_merge: true,
};

export default {
  /**
   * Configure the GitHub repo with default settings:
   * - Do not enable merge commits on PR
   * - Automatically delete branches after PR merge
   * @returns {boolean} True if enabled, false otherwise
   */
  async enable() {
    const { username, repo } = await githubHelper.repoData();
    const settingsUrl = `https://github.com/${username}/${repo}/settings`;

    // Fail early if no token available
    if (!githubHelper.hasToken()) {
      this.__consoleError(
        'GitHub: ABERLAAS_GITHUB_TOKEN environment variable must be set',
      );
      this.__consoleInfo("  Create a Classic token with 'repo' scope");
      this.__consoleInfo('  https://github.com/settings/tokens\n');
      return false;
    }

    // Check if already configured
    try {
      if (await this.isAlreadyConfigured()) {
        this.__consoleSuccess('GitHub: Already configured');
        this.__consoleInfo(`  ${settingsUrl}\n`);
        return true;
      }
    } catch (error) {
      if (error.status === 401) {
        this.__consoleError('GitHub: ABERLAAS_GITHUB_TOKEN is invalid');
        this.__consoleInfo("  Create a Classic token with 'repo' scope");
        this.__consoleInfo('  https://github.com/settings/tokens\n');
        return false;
      }
      throw error;
    }

    await githubHelper.octokit('repos.update', {
      owner: username,
      repo,
      ...gitHubSettings,
    });

    this.__consoleSuccess('GitHub: Repository configured');
    this.__consoleInfo(`  ${settingsUrl}\n`);
    return true;
  },
  /**
   * Check if GitHub repo is already configured with desired settings
   * @returns {boolean} True if already configured, false otherwise
   */
  async isAlreadyConfigured() {
    const { username, repo } = await githubHelper.repoData();
    const repoData = await githubHelper.octokit('repos.get', {
      owner: username,
      repo,
    });

    return _.isMatch(repoData, gitHubSettings);
  },
  __consoleSuccess: consoleSuccess,
  __consoleInfo: consoleInfo,
  __consoleError: consoleError,
};
