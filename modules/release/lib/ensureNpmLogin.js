import { _ } from 'golgoth';
import {
  consoleInfo,
  consoleWarn,
  env,
  prompt,
  readJson,
  run,
  sleep,
} from 'firost';
import { hostPackagePath } from 'aberlaas-helper';
import { getNpmAuthToken, setNpmAuthToken } from './helper.js';

export let __;

/**
 * Ensures the user is logged in to npm by checking authentication status and prompting for login if needed.
 * @returns {boolean|undefined} Returns true if already logged in, undefined if login was required and completed
 * @throws {Error} Throws error if npm authentication fails for reasons other than E401 unauthorized
 */
export async function ensureNpmLogin() {
  if (await __.isAuthenticated()) {
    return true;
  }

  await __.waitForNpmLogin();
}

__ = {
  ensureNpmLogin,
  /**
   * Checks if the user is authenticated with npm by running 'yarn npm whoami' command
   * @returns {boolean} Promise that resolves to true if authenticated, false otherwise
   */
  async isAuthenticated() {
    const npmAuthToken = await __.getNpmAuthToken();

    try {
      await __.run('yarn npm whoami', {
        stderr: false,
        stdout: false,
        env: {
          ABERLAAS_RELEASE_NPM_AUTH_TOKEN: npmAuthToken,
        },
      });
      return true;
    } catch (_err) {
      return false;
    }
  },
  /**
   * Prompts the user to create and configure an npm authentication token when not logged in.
   * Opens the npm token creation page in browser, guides user through token setup,
   * collects the token, and saves it to .npmrc file.
   */
  async waitForNpmLogin() {
    __.consoleWarn('You are not currently authentified to npm.');

    await __.displayLoginInstructions();
    await __.openBrowserForToken();
    await __.saveNpmToken();

    // Try again
    await __.ensureNpmLogin();
  },

  /**
   * Displays login instructions to the user
   */
  async displayLoginInstructions() {
    const packageJson = await readJson(hostPackagePath('package.json'));
    const tokenName = __.generateTokenName(packageJson);

    __.consoleInfo('');
    __.consoleInfo('Your npm token page will open.');
    __.consoleInfo('We suggest you fill in the following informations:');
    __.consoleInfo('');
    __.consoleInfo('GENERAL');
    __.consoleInfo(`Token name*: ${tokenName}`);
    __.consoleInfo('☑️ Bypass two-factor authentication (2FA)');
    __.consoleInfo('');
    __.consoleInfo('PACKAGE AND SCOPES');
    __.consoleInfo('Permissions: Read and write');
    __.consoleInfo('🔘 All packages');
    __.consoleInfo('');
    __.consoleInfo('EXPIRATION');
    __.consoleInfo('Expiration date: 90 days');
    __.consoleInfo('');
  },

  /**
   * Generates a suggested token name from package.json data
   * @param {object} packageJson - The package.json content
   * @returns {string} The suggested token name
   */
  generateTokenName(packageJson) {
    let packageName = packageJson.name;

    // For workspace roots (monorepo/libdocs), strip suffixes
    if (packageJson.workspaces) {
      packageName = _.chain(packageName)
        .replace(/-monorepo$/, '')
        .replace(/-root$/, '')
        .value();
    }

    const cleanPackageName = _.chain(packageName)
      .replaceAll('-', '_')
      .replaceAll('@', '')
      .replaceAll('/', '_')
      .toUpper()
      .value();
    return `ABERLAAS_RELEASE_${cleanPackageName}`;
  },

  /**
   * Opens browser for token creation
   */
  async openBrowserForToken() {
    const npmUsername = await __.getNpmUsername();
    const tokenUrl = __.buildTokenUrl(npmUsername);

    await __.prompt('Press Enter to open the webpage');
    __.run(`$BROWSER ${tokenUrl}`, { shell: true, stderr: false });
    await __.sleep(2000);
  },

  /**
   * Gets the NPM username from environment variable or prompts user for input
   * @returns {string} The NPM username
   */
  async getNpmUsername() {
    return (
      __.env('ABERLAAS_NPM_USERNAME') || (await __.prompt('NPM Username: '))
    );
  },

  /**
   * Builds the npm token creation URL for a given username
   * @param {string} npmUsername - The npm username
   * @returns {string} The token creation URL
   */
  buildTokenUrl(npmUsername) {
    return `https://www.npmjs.com/settings/${npmUsername}/tokens/granular-access-tokens/new`;
  },

  /**
   * Saves the npm token to .env file
   */
  async saveNpmToken() {
    const npmToken = await __.prompt('Enter you new token here:');
    await __.setNpmAuthToken(npmToken);
  },
  getNpmAuthToken,
  setNpmAuthToken,
  run,
  env,
  prompt,
  consoleWarn,
  consoleInfo,
  sleep,
};
