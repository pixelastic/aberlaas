import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { getKey, setKey } from 'keyleth';

/**
 * Finds the last release point for git diff operations
 * @param {string} version - Current version number (e.g., '1.2.3')
 * @returns {Promise<string|null>} Tag name if exists (e.g., 'v1.2.3'), or null to search from repo beginning
 */
export async function getLastReleasePoint(version) {
  const repo = new Gilmore(hostGitRoot());

  const tagName = `v${version}`;
  const tagExists = await repo.tagExists(tagName);
  return tagExists ? tagName : null;
}

/**
 * Retrieves the npm authentication token from .env file
 * @returns {string} The npm auth token, or null if not found
 */
export async function getNpmAuthToken() {
  return await getKey('ABERLAAS_RELEASE_NPM_AUTH_TOKEN', {
    cwd: hostGitRoot(),
  });
}

/**
 * Saves the npm authentication token to .env file
 * @param {string} token - The npm auth token to save
 */
export async function setNpmAuthToken(token) {
  await setKey('ABERLAAS_RELEASE_NPM_AUTH_TOKEN', token, {
    cwd: hostGitRoot(),
  });
}
