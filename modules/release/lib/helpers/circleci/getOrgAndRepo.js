import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';

export let __;

/**
 * Get org and repo from git remote
 * @returns {object} { org, repo }
 */
export async function getOrgAndRepo() {
  const repo = __.createRepo();
  const org = await repo.githubRepoOwner();
  const name = await repo.githubRepoName();
  return { org, repo: name };
}

__ = {
  /**
   * Create a Gilmore repo instance for the host git root
   * @returns {object} Gilmore instance
   */
  createRepo() {
    return new Gilmore(hostGitRoot());
  },
};
