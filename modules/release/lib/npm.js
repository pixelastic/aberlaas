import {
  consoleInfo,
  consoleWarn,
  env,
  firostError,
  prompt,
  readJson,
  run,
  sleep,
  write,
} from 'firost';
import { _ } from 'golgoth';
import { hostGitPath, hostPackagePath } from 'aberlaas-helper';

/**
 * Ensures the user is logged in to npm by checking authentication status and prompting for login if needed.
 * @returns {Promise<boolean|undefined>} Returns true if already logged in, undefined if login was required and completed
 * @throws {Error} Throws error if npm authentication fails for reasons other than E401 unauthorized
 */
export async function ensureNpmLogin() {
  try {
    await npmRun('whoami');
    return true;
  } catch (err) {
    if (err.code == 'ABERLAAS_RELEASE_NPM_ERROR_E401') {
      await waitForNpmLogin();
      return;
    }
    throw err;
  }
}

/**
 * Gets the NPM username from environment variable or prompts user for input
 * @returns {Promise<string>} The NPM username
 */
async function getNpmUsername() {
  return env('ABERLAAS_NPM_USERNAME') || (await prompt('NPM Username: '));
}

/**
 * Prompts the user to create and configure an npm authentication token when not logged in.
 * Opens the npm token creation page in browser, guides user through token setup,
 * collects the token, and saves it to .npmrc file.
 * @returns {Promise<void>} Promise that resolves when npm login process is complete
 */
async function waitForNpmLogin() {
  consoleWarn('You are not currently authentified to npm.');

  const npmUsername = await getNpmUsername();
  const tokenUrl = `https://www.npmjs.com/settings/${npmUsername}/tokens/granular-access-tokens/new`;

  const rootPackage = await readJson(hostPackagePath('package.json'));
  const packageName = rootPackage.name;
  const tokenName = `ABERLAAS_RELEASE_${_.toUpper(packageName)}`;

  consoleInfo('');
  consoleInfo('Your npm token page will open.');
  consoleInfo('We suggest you fill in the following informations:');
  consoleInfo('');
  consoleInfo('GENERAL');
  consoleInfo(`Token name*: ${tokenName}`);
  consoleInfo('☑️ Bypass two-factor authentication (2FA)');
  consoleInfo('');
  consoleInfo('PACKAGE AND SCOPES');
  consoleInfo('Permissions: Read and write');
  consoleInfo(`🔘 Only select packages and scopes: ${packageName}`);
  consoleInfo('');
  consoleInfo('EXPIRATION');
  consoleInfo('Expiration date: 90 days');
  consoleInfo('');
  await prompt('Press Enter to open the webpage');

  // Note: We purposefuly do not use await before run() here because we don't
  // want to wait until the browser is closed to display the next prompt
  run(`$BROWSER ${tokenUrl}`, { shell: true, stderr: false });

  await sleep(2000);
  const npmToken = await prompt('Enter you new token here:');

  const npmrcContent = `//registry.npmjs.org/:_authToken=${npmToken}`;
  const npmrcPath = hostGitPath('.npmrc');
  await write(npmrcContent, npmrcPath);

  // Try again
  await ensureNpmLogin();
}

/**
 * Executes an npm command and returns its output
 * @param {string} command - The npm command to execute (without 'npm' prefix)
 * @returns {Promise<string>} The stdout output from the npm command
 * @throws {Error} Throws a formatted error if the npm command fails
 */
async function npmRun(command) {
  try {
    const { stdout } = await run(`npm ${command}`, {
      stdout: false,
      stderr: false,
    });
    return stdout;
  } catch ({ stderr }) {
    const errorLines = _.split(stderr, '\n');

    if (_.startsWith(errorLines[0], 'npm error code')) {
      const npmErrorCode = _.replace(errorLines[0], 'npm error code ', '');
      const npmErrorMessage = _.chain(errorLines).slice(1).join('\n').value();
      throw firostError(
        `ABERLAAS_RELEASE_NPM_ERROR_${npmErrorCode}`,
        npmErrorMessage,
      );
    }
  }
}
