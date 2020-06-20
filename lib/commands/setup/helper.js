const run = require('firost/lib/run');
const got = require('golgoth/lib/got');
const _ = require('golgoth/lib/lodash');
const parseGithubUrl = require('parse-github-repo-url');
module.exports = {
  /**
   * Returns the CircleCI token saved in ENV
   * @returns {string} The CircleCI token
   **/
  circleCiToken() {
    return process.env.CIRCLECI_TOKEN;
  },
  /**
   * Check if a CircleCI token is available
   * @returns {boolean} True if a token is defined
   **/
  hasCircleCiToken() {
    return !!this.circleCiToken();
  },
  /**
   * Make a call to the CircleCI v1 API
   * @param {string} urlPath Part of the url after the /api/v1.1/
   * @param {object} userGotOptions Options to pass to the got call
   * @returns {object} Object returned by the API
   **/
  async circleCiV1(urlPath, userGotOptions = {}) {
    const token = this.circleCiToken();
    const apiUrl = `https://circleci.com/api/v1.1/${urlPath}?circle-token=${token}`;
    const defaultGotOptions = {
      responseType: 'json',
    };
    const gotOptions = _.merge({}, defaultGotOptions, userGotOptions);
    const response = await this.__got(apiUrl, gotOptions);
    return response.body;
  },
  /**
   * Returns the npm token saved in ENV
   * @returns {string} The npm token
   **/
  npmToken() {
    return process.env.NPM_TOKEN;
  },
  /**
   * Check if a npm token is available
   * @returns {boolean} True if a token is defined
   **/
  hasNpmToken() {
    return !!this.npmToken();
  },
  /**
   * Returns the GitHub token saved in ENV
   * @returns {string} The GitHub token
   **/
  githubToken() {
    return process.env.GITHUB_TOKEN;
  },
  /**
   * Check if a GitHub token is available
   * @returns {boolean} True if a token is defined
   **/
  hasGithubToken() {
    return !!this.githubToken();
  },
  /**
   * Returns some data from the git config
   * @returns {object} Object with .username, .repo and .email keys
   **/
  async githubData() {
    if (this.__cache.githubData) {
      return this.__cache.githubData;
    }

    const email = await this.gitConfig('user.email');
    const remoteUrl = await this.gitConfig('remote.origin.url');
    const [username, repo] = parseGithubUrl(remoteUrl);

    const result = { username, repo, email };
    this.__cache.githubData = result;
    return result;
  },
  async gitConfig(key) {
    const response = await this.__run(`git config ${key}`, {
      stdout: false,
    });
    return response.stdout;
  },
  __run: run,
  __got: got,
  __cache: {},
};
