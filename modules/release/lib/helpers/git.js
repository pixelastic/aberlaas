import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';

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
