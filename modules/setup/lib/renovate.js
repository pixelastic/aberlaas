import { consoleError, consoleInfo, consoleSuccess } from 'firost';
import { getRepoData, hasToken, octokit } from './helpers/github.js';

export let __;

/**
 * Attempt to automatically add the current repo to renovate, otherwise
 * display the link to do it manually
 * @returns {boolean} True if enabled, false otherwise
 */
export async function enable() {
  const { username, repo } = await __.getRepoData();
  const manualUrl = `https://github.com/settings/installations/${__.renovateId}`;
  const renovateDashboardUrl = `https://developer.mend.io/github/${username}/${repo}`;

  // Fail early if no token available
  if (!__.hasToken()) {
    __.consoleError(
      'Renovate: ABERLAAS_GITHUB_TOKEN environment variable must be set',
    );
    __.consoleInfo("  Create a Classic token with 'repo' scope");
    __.consoleInfo('  https://github.com/settings/tokens\n');
    return false;
  }

  // Check if already enabled
  if (await __.isAlreadyEnabled()) {
    __.consoleSuccess('Renovate: Already configured');
    __.consoleInfo(`  ${renovateDashboardUrl}\n`);
    return true;
  }

  try {
    const repositoryId = await __.getRepositoryId();
    await __.octokit('apps.addRepoToInstallation', {
      installation_id: __.renovateId,
      repository_id: repositoryId,
    });
  } catch (_err) {
    __.consoleError('Renovate is not installed with this GitHub account');
    __.consoleInfo('  Please visit the installation page to install it first');
    __.consoleInfo(`  ${manualUrl}\n`);
    return false;
  }

  __.consoleSuccess('Renovate: Repository configured');
  __.consoleInfo(`  ${renovateDashboardUrl}\n`);
  return true;
}

__ = {
  renovateId: 2471197,
  /**
   * Returns the GitHub repository Id
   * @returns {number} Repository Id
   */
  async getRepositoryId() {
    const { username, repo } = await __.getRepoData();
    const { id } = await __.octokit('repos.get', {
      owner: username,
      repo,
    });
    return id;
  },
  /**
   * Check if Renovate is already enabled for this repository
   * @returns {boolean} True if already enabled, false otherwise
   */
  async isAlreadyEnabled() {
    try {
      const { username, repo } = await __.getRepoData();
      const installations = await __.octokit(
        'apps.listReposAccessibleToInstallation',
        {
          installation_id: __.renovateId,
        },
      );

      return installations.repositories.some(
        (item) => item.owner.login === username && item.name === repo,
      );
    } catch {
      // API call fails if Renovate app is not installed - treat as not enabled
      return false;
    }
  },
  consoleSuccess,
  consoleInfo,
  consoleError,
  getRepoData,
  hasToken,
  octokit,
};

export default { enable };
