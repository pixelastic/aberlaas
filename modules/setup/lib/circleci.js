import { _ } from 'golgoth';
import { consoleError, consoleInfo, consoleSuccess } from 'firost';
import circleCiHelper from './helpers/circleci.js';
import githubHelper from './helpers/github.js';

export let __;

/**
 * Attempt to automatically follow the repo in CircleCI if possible, otherwise
 * display the link to follow it manually
 * @returns {boolean} True if enabled, false otherwise
 */
export async function enable() {
  const { username, repo } = await githubHelper.repoData();
  const projectUrl = `https://app.circleci.com/pipelines/github/${username}/${repo}`;

  // Fail early if no token available
  if (!circleCiHelper.hasToken()) {
    __.consoleError(
      'CircleCI: ABERLAAS_CIRCLECI_TOKEN environment variable must be set',
    );
    __.consoleInfo('  Create a token at CircleCI account settings');
    __.consoleInfo('  https://circleci.com/account/api\n');
    return false;
  }

  // Do nothing if already enabled
  if (await __.isEnabled()) {
    __.consoleSuccess('CircleCI: Already configured');
    __.consoleInfo(`  ${projectUrl}\n`);
    return true;
  }

  // Follow the repo
  await __.followRepo();
  __.consoleSuccess('CircleCI: Repository configured');
  __.consoleInfo(`  ${projectUrl}\n`);
  return true;
}

__ = {
  /**
   * Check if CircleCI is already enabled for this project
   * @returns {boolean} True if already enabled, false otherwise
   */
  async isEnabled() {
    // There is no endpoint to check if a project is followed or not, so we get
    // the list of all followed projects and check if the current one is in it
    const allProjects = await circleCiHelper.api('projects');
    const { username, repo } = await githubHelper.repoData();
    const thisProject = _.find(allProjects, { username, reponame: repo });
    return !!thisProject;
  },
  /**
   * Automatically follow the repo on CircleCI.
   */
  async followRepo() {
    const { username, repo } = await githubHelper.repoData();
    await circleCiHelper.api(`project/github/${username}/${repo}/follow`, {
      method: 'post',
    });
  },
  consoleInfo,
  consoleSuccess,
  consoleError,
};

export default { enable };
