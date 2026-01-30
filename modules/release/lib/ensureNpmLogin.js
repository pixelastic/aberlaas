import { _ } from 'golgoth';
import {
  consoleInfo,
  consoleWarn,
  env,
  firostError,
  prompt,
  readJson,
  run,
  sleep,
  wrap,
  write,
} from 'firost';
import { hostGitPath, hostPackagePath } from 'aberlaas-helper';

export const __ = {
  /**
   * Ensures the user is logged in to npm by checking authentication status and prompting for login if needed.
   * @returns {boolean|undefined} Returns true if already logged in, undefined if login was required and completed
   * @throws {Error} Throws error if npm authentication fails for reasons other than E401 unauthorized
   */
  async ensureNpmLogin() {
    try {
      await __.npmRun('whoami');
      return true;
    } catch (err) {
      if (err.code == 'ABERLAAS_RELEASE_NPM_ERROR_E401') {
        await __.waitForNpmLogin();
        return;
      }
      throw err;
    }
  },

  /**
   * Executes an npm command and returns its output
   * @param {string} command - The npm command to execute (without 'npm' prefix)
   * @returns {string} The stdout output from the npm command
   * @throws {Error} Throws a formatted error if the npm command fails
   */
  async npmRun(command) {
    try {
      const { stdout } = await __.run(`npm ${command}`, {
        stdout: false,
        stderr: false,
      });
      return stdout;
    } catch ({ stderr }) {
      const errorLines = _.split(stderr, '\n');

      // Identify known npm errors
      if (_.startsWith(errorLines[0], 'npm error code')) {
        const npmErrorCode = _.replace(errorLines[0], 'npm error code ', '');
        const npmErrorMessage = _.chain(errorLines).slice(1).join('\n').value();
        throw firostError(
          `ABERLAAS_RELEASE_NPM_ERROR_${npmErrorCode}`,
          npmErrorMessage,
        );
      }

      // Throw unknown errors up
      throw firostError('ABERLAAS_RELEASE_NPM_UNKNOWN_ERROR', stderr);
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
    const rootPackage = await readJson(hostPackagePath('package.json'));
    const packageName = rootPackage.name;
    const tokenName = __.generateTokenName(packageName);

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
   * Generates a suggested token name from package name
   * @param {string} packageName - The package name
   * @returns {string} The suggested token name
   */
  generateTokenName(packageName) {
    const cleanPackageName = _.chain(packageName)
      .replace('-', '_')
      .replace('@', '')
      .replace('/', '_')
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
   * Saves the npm token to .npmrc file
   */
  async saveNpmToken() {
    const npmToken = await __.prompt('Enter you new token here:');
    const npmrcContent = `//registry.npmjs.org/:_authToken=${npmToken}`;
    const npmrcPath = hostGitPath('.npmrc');
    await write(npmrcContent, npmrcPath);
  },
  run,
  env,
  prompt,
  consoleWarn,
  consoleInfo,
  sleep,
};

export const ensureNpmLogin = wrap(__, 'ensureNpmLogin');
