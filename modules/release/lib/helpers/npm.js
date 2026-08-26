import { run } from 'firost';
import { npmVersion } from 'aberlaas-versions';

export let __;

/**
 * Ensure the user is logged in to npm via npx npm login
 * Checks whoami, runs interactive login if needed, then re-checks
 * @returns {Promise<void>}
 */
export async function ensureNpmLogin() {
  if (await __.isAuthenticated()) {
    return;
  }

  await __.run(`npx npm@${npmVersion} login`, { stdin: true });
  await __.ensureNpmLogin();
}

__ = {
  /**
   * Check if the user is authenticated with npm via npx npm whoami
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  async isAuthenticated() {
    try {
      await __.run(`npx npm@${npmVersion} whoami`, {
        stderr: false,
        stdout: false,
      });
      return true;
    } catch (_err) {
      return false;
    }
  },
  ensureNpmLogin,
  run,
};
