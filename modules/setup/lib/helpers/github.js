import { run } from 'firost';
import { Octokit } from '@octokit/rest';
import parseGithubUrl from 'parse-github-repo-url';
import { _ } from 'golgoth';

export default {
  /**
   * Returns the GitHub token saved in ENV
   * @returns {string} The GitHub token
   */
  token() {
    return process.env.GITHUB_TOKEN;
  },
  /**
   * Check if a GitHub token is available
   * @returns {boolean} True if a token is defined
   */
  hasToken() {
    return !!this.token();
  },
  /**
   * Returns some data from the git config
   * @returns {object} Object with .username, .repo and .email keys
   */
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
  /**
   * Return the value of a git config
   * @param {string} key Config key
   * @returns {string} Config value
   */
  async config(key) {
    const response = await this.__run(`git config ${key}`, {
      stdout: false,
    });
    return response.stdout;
  },
  /**
   * Wraps Octokit and return the results
   * @param {string} methodPath Path of the method to call
   * @param {object} options Options to pass to the method
   * @returns {*} Response from the API
   */
  async octokit(methodPath, options) {
    // Instanciate Octokit if not available
    if (!this.__cache.octokit) {
      const githubToken = this.token();
      this.__cache.octokit = new this.__Octokit({
        auth: githubToken,
      });
    }

    const octokit = this.__cache.octokit;
    const method = _.get(octokit, methodPath);
    const response = await method(options);
    return response.data;
  },
  __run: run,
  __Octokit: Octokit,
  __cache: {},
};
