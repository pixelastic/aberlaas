import { _ } from 'golgoth';
import { exists, read, remove, write } from 'firost';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';

/**
 * Remove legacy npm auth artifacts from the host project
 * Removes npmAuthToken line from .yarnrc.yml (and commits), deletes .env
 * @deprecated Temporary cleanup — remove once all downstream projects have migrated
 * @returns {Promise<boolean>} True if anything was cleaned up
 */
export async function removeLegacyNpmAuth() {
  let didCleanup = false;

  // Remove .env, was only used to save the legacy npm token
  const envPath = hostGitPath('.env');
  if (await exists(envPath)) {
    await remove(envPath);
    didCleanup = true;
  }

  // Fail-safe if no .yarnrc.yml
  const yarnrcPath = hostGitPath('.yarnrc.yml');
  if (!(await exists(yarnrcPath))) {
    return didCleanup;
  }

  // Remove the npmAuthToken: line
  const content = await read(yarnrcPath);
  const cleaned = _.replace(content, /^npmAuthToken:.*\n?/m, '');
  if (cleaned === content) {
    return didCleanup;
  }

  // Rewrite the file back, and commit it
  await write(cleaned, yarnrcPath);
  const repo = new Gilmore(hostGitRoot());
  await repo.add('.yarnrc.yml');
  await repo.commit('chore(release): remove legacy npm auth token');
  return true;
}
