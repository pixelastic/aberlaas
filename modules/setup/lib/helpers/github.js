import { _ } from 'golgoth';
import { run } from 'firost';
import { Octokit } from '@octokit/rest';
import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import parseGithubUrl from 'parse-github-repo-url';

export let __;
/**
 * Check if a GitHub token is available
 * @returns {boolean} True if a token is defined
 */
export function hasToken() {
  return !!__.token();
}
/**
 * Returns some data from the git config
 * @returns {object} Object with .username, .repo and .email keys
 */
export async function getRepoData() {
  if (__.cache.repoData) {
    return __.cache.repoData;
  }

  const email = await __.config('user.email');
  const remoteUrl = await __.config('remote.origin.url');
  const [username, repo] = parseGithubUrl(remoteUrl);

  const result = { username, repo, email };
  __.cache.repoData = result;
  return result;
}
/**
 * Wraps Octokit and return the results
 * @param {string} methodPath Path of the method to call
 * @param {object} options Options to pass to the method
 * @returns {*} Response from the API
 */
export async function octokit(methodPath, options) {
  // Instanciate Octokit if not available
  if (!__.cache.octokit) {
    const githubToken = __.token();
    __.cache.octokit = __.newOctokit({
      auth: githubToken,
      log: {
        debug: __.noOp,
        info: __.noOp,
        warn: __.noOp,
        error: __.noOp,
      },
    });
  }

  const octokitInstance = __.cache.octokit;
  const method = _.get(octokitInstance, methodPath);
  const response = await method(options);
  return response.data;
}

__ = {
  cache: {},
  clearCache() {
    __.cache = {};
  },
  noOp: () => {},
  /**
   * Returns the GitHub token saved in ENV
   * @returns {string} The GitHub token
   */
  token() {
    return process.env.ABERLAAS_GITHUB_TOKEN;
  },
  /**
   * Return the value of a git config
   * @param {string} key Config key
   * @returns {string} Config value
   */
  async config(key) {
    if (!__.cache.repository) {
      __.cache.repository = new Gilmore(hostGitRoot());
    }

    const repository = __.cache.repository;
    return await repository.getConfig(key);
  },
  /**
   * Creates a new Octokit instance
   * @param {...any} args - Arguments to pass to the Octokit constructor
   * @returns {Octokit} A new Octokit instance
   */
  newOctokit(...args) {
    return new Octokit(...args);
  },
  run,
};
