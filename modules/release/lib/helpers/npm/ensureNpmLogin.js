import { run, spinner } from 'firost';
import { npmVersion } from 'aberlaas-versions';

export let __;

/**
 * Ensure the user is logged in to npm via npx npm login
 * Checks whoami, prompts for browser login if needed, then re-checks
 * @returns {Promise<void>}
 */
export async function ensureNpmLogin() {
  const progress = __.spinner();
  progress.tick('Checking npm authentication...');

  if (await __.isAuthenticated()) {
    progress.success('Authenticated to npm');
    return;
  }

  progress.info(
    'Opening npm login (required for trusted publisher registration)...',
  );
  await __.run(`npx npm@${npmVersion} login --loglevel=warn`, { stdin: true });
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
  spinner,
  run,
};
