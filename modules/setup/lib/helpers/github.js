import { _ } from 'golgoth';
import { firostError, run } from 'firost';
import { Octokit } from '@octokit/rest';
import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import parseGithubUrl from 'parse-github-repo-url';

export let __;
/**
 * Ensure ABERLAAS_GITHUB_TOKEN is set and accepted by GitHub
 * @throws {Error} ABERLAAS_SETUP_NO_GITHUB_TOKEN if missing or empty
 * @throws {Error} ABERLAAS_SETUP_GITHUB_TOKEN_INVALID if GitHub rejects it
 */
export async function ensureGithubToken() {
  // No token
  if (!__.token()) {
    throw firostError(
      'ABERLAAS_SETUP_NO_GITHUB_TOKEN',
      "ABERLAAS_GITHUB_TOKEN is not set. Create a Classic token with 'repo' scope at https://github.com/settings/tokens",
    );
  }

  // Token expired or revoked
  try {
    await __.octokit('users.getAuthenticated');
  } catch (error) {
    if (error.status !== 401) {
      throw error;
    }
    throw firostError(
      'ABERLAAS_SETUP_GITHUB_TOKEN_INVALID',
      "ABERLAAS_GITHUB_TOKEN is invalid. Create a Classic token with 'repo' scope at https://github.com/settings/tokens",
    );
  }
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
  octokit,
  run,
};
