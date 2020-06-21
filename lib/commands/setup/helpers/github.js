const run = require('firost/lib/run');
const { Octokit } = require('@octokit/rest');
const parseGithubUrl = require('parse-github-repo-url');
const _ = require('golgoth/lib/lodash');
module.exports = {
  /**
   * Returns the GitHub token saved in ENV
   * @returns {string} The GitHub token
   **/
  token() {
    return process.env.GITHUB_TOKEN;
  },
  /**
   * Check if a GitHub token is available
   * @returns {boolean} True if a token is defined
   **/
  hasToken() {
    return !!this.token();
  },
  /**
   * Returns some data from the git config
   * @returns {object} Object with .username, .repo and .email keys
   **/
  async repoData() {
    if (this.__cache.repoData) {
      return this.__cache.repoData;
    }

    const email = await this.config('user.email');
    const remoteUrl = await this.config('remote.origin.url');
    const [username, repo] = parseGithubUrl(remoteUrl);

    const result = { username, repo, email };
    this.__cache.githubData = result;
    return result;
  },
  async config(key) {
    const response = await this.__run(`git config ${key}`, {
      stdout: false,
    });
    return response.stdout;
  },
  async octokit(methodPath, options) {
    // Instanciate Octokit if not available
    if (!this.__cache.octokit) {
      const githubToken = this.token();
      this.__cache.octokit = new Octokit({
        auth: githubToken,
      });
    }

    const octokit = this.__cache.octokit;
    const method = _.get(octokit, methodPath);
    const response = await method(options);
    return response.data;
  },
  __run: run,
  __cache: {},
};
