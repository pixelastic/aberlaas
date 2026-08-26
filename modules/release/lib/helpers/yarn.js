import { run } from 'firost';

export let __;

/**
 * Ensure the user is logged in to npm via yarn npm login
 * Checks whoami, runs interactive login if needed, then re-checks
 * @returns {Promise<void>}
 */
export async function ensureYarnNpmLogin() {
  if (await __.isAuthenticated()) {
    return;
  }

  await __.run('yarn npm login', { stdin: true });
  await __.isAuthenticated();
}

__ = {
  /**
   * Check if the user is authenticated with npm via yarn npm whoami
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  async isAuthenticated() {
    try {
      await __.run('yarn npm whoami', { stderr: false, stdout: false });
      return true;
    } catch (_err) {
      return false;
    }
  },
  run,
};
