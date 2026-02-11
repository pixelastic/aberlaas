import { _ } from 'golgoth';
import { consoleError, consoleInfo, consoleSuccess } from 'firost';
import { getRepoData, hasToken, octokit } from './helpers/github.js';

export let __;

const gitHubSettings = {
  allow_merge_commit: false,
  allow_rebase_merge: true,
  allow_squash_merge: true,
  delete_branch_on_merge: true,
};

/**
 * Configure the GitHub repo with default settings:
 * - Do not enable merge commits on PR
 * - Automatically delete branches after PR merge
 * @returns {boolean} True if enabled, false otherwise
 */
export async function enable() {
  const { username, repo } = await __.getRepoData();
  const settingsUrl = `https://github.com/${username}/${repo}/settings`;

  // Fail early if no token available
  if (!__.hasToken()) {
    __.consoleError(
      'GitHub: ABERLAAS_GITHUB_TOKEN environment variable must be set',
    );
    __.consoleInfo("  Create a Classic token with 'repo' scope");
    __.consoleInfo('  https://github.com/settings/tokens\n');
    return false;
  }

  // Check if already configured
  try {
    if (await __.isAlreadyConfigured()) {
      __.consoleSuccess('GitHub: Already configured');
      __.consoleInfo(`  ${settingsUrl}\n`);
      return true;
    }
  } catch (error) {
    if (error.status === 401) {
      __.consoleError('GitHub: ABERLAAS_GITHUB_TOKEN is invalid');
      __.consoleInfo("  Create a Classic token with 'repo' scope");
      __.consoleInfo('  https://github.com/settings/tokens\n');
      return false;
    }
    throw error;
  }

  await __.octokit('repos.update', {
    owner: username,
    repo,
    ...gitHubSettings,
  });

  __.consoleSuccess('GitHub: Repository configured');
  __.consoleInfo(`  ${settingsUrl}\n`);
  return true;
}

__ = {
  /**
   * Check if GitHub repo is already configured with desired settings
   * @returns {boolean} True if already configured, false otherwise
   */
  async isAlreadyConfigured() {
    const { username, repo } = await __.getRepoData();
    const repoData = await __.octokit('repos.get', {
      owner: username,
      repo,
    });

    return _.isMatch(repoData, gitHubSettings);
  },
  consoleSuccess,
  consoleInfo,
  consoleError,
  getRepoData,
  hasToken,
  octokit,
};

export default { enable };
