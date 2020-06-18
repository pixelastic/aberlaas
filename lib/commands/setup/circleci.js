const got = require('golgoth/lib/got');
const run = require('firost/lib/run');
const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
const parseGithubUrl = require('parse-github-repo-url');
module.exports = {
  /**
   * Returns the CircleCI token saved in ENV
   * @returns {string} The CircleCI token
   **/
  token() {
    return process.env.CIRCLECI_TOKEN;
  },
  /**
   * Check if a token is available
   * @returns {boolean} True if a token is defined
   **/
  hasToken() {
    return !!this.token();
  },
  /**
   * Returns github username and repo from the git config
   * @returns {object} Object with .username and .repo keys
   **/
  async githubData() {
    const remoteUrl = await run('git config remote.origin.url', {
      stdout: false,
    });
    const [username, repo] = parseGithubUrl(remoteUrl.stdout);
    return { username, repo };
  },
  /**
   * Returns the url to follow to manually follow the repo on CircleCI
   * @returns {string} Url to click on
   **/
  async followUrl() {
    const { username, repo } = await this.githubData();
    return `https://app.circleci.com/projects/project-setup/github/${username}/${repo}`;
  },
  /**
   * Automatically follow the repo on CircleCI.
   * A token is required for this to work
   **/
  async followRepo() {
    const { username, repo } = await this.githubData();
    const token = this.token();
    const apiUrl = `https://circleci.com/api/v1.1/project/github/${username}/${repo}/follow?circle-token=${token}`;
    await got.post(apiUrl);
    this.__consoleSuccess('CircleCI enabled');
  },
  /**
   * Attempt to automatically follow the repo in CircleCI if possible, otherwise
   * display the link to follow it manually
   **/
  async run() {
    if (this.hasToken()) {
      await this.followRepo();
      return;
    }

    const followUrl = await this.followUrl();
    this.__consoleInfo(`[circleci] Please visit ${followUrl}`);
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
};
