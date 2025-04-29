import { _ } from 'golgoth';
import { consoleError, consoleInfo, consoleSuccess } from 'firost';
import circleCiHelper from './helpers/circleci.js';
import githubHelper from './helpers/github.js';

export default {
  /**
   * Attempt to automatically follow the repo in CircleCI if possible, otherwise
   * display the link to follow it manually
   * @returns {boolean} True if enabled, false otherwise
   */
  async enable() {
    const { username, repo } = await githubHelper.repoData();
    const projectUrl = `https://app.circleci.com/pipelines/github/${username}/${repo}`;
    const followUrl = `https://app.circleci.com/projects/project-setup/github/${username}/${repo}`;

    // Fail early if no token available
    if (!circleCiHelper.hasToken()) {
      this.__consoleError(
        `[circleci]: No ABERLAAS_CIRCLECI_TOKEN found, please visit ${followUrl} to enable manually.`,
      );
      return false;
    }

    // Do nothing if already enabled
    if (await this.isEnabled()) {
      this.__consoleInfo(`CircleCI already enabled: ${projectUrl}`);
      return true;
    }

    // Follow the repo
    await this.followRepo();
    this.__consoleSuccess(`CircleCI enabled: ${projectUrl}`);
    return true;
  },
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
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
