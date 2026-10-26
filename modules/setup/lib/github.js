import { _ } from 'golgoth';
import { consoleInfo, consoleSuccess } from 'firost';
import { getRepoData, octokit } from './helpers/github.js';

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

  // Check if already configured
  if (await __.isAlreadyConfigured()) {
    __.consoleSuccess('GitHub: Already configured');
    __.consoleInfo(`  ${settingsUrl}\n`);
    return true;
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
  getRepoData,
  octokit,
};

export default { enable };
