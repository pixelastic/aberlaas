import { consoleInfo, firostError, run as firostRun } from 'firost';
import ciInfo from 'ci-info';

export let __;

/**
 * Run CI scripts and fail the job if any fails
 * Runs lint and test by default, but can be changed with --no-test and
 * --no-lint
 * @param {object} cliArgs CLI Argument object, as created by minimist
 * @returns {boolean} True on success, throws on error
 */
export async function run(cliArgs = {}) {
  const args = {
    test: true,
    lint: true,
    ...cliArgs,
  };

  if (!__.isCI()) {
    throw firostError(
      'ABERLAAS_CI_NOT_CI_ENVIRONMENT',
      'Current system is not a CI. Use CI=1 to force',
    );
  }

  await __.displayVersions();

  if (args.test) {
    await __.yarnRunTest();
  }

  if (args.lint) {
    await __.yarnRunLint();
  }

  return true;
}

__ = {
  /**
   * Checks if currently running on a CI server
   * @returns {boolean} True if on a CI server
   */
  isCI() {
    return ciInfo.isCI;
  },
  /**
   * Displays the current versions of Node.js and Yarn by executing version commands
   */
  async displayVersions() {
    const nodeVersion = await __.runCommand('node --version');
    const yarnVersion = await __.runCommand('yarn --version');
    __.consoleInfo(`node ${nodeVersion}, yarn ${yarnVersion}`);
  },
  /**
   * Executes a command asynchronously and returns the stdout output
   * @param {string} command - The command to execute
   * @returns {string} The stdout output of the executed command
   */
  async runCommand(command) {
    const { stdout } = await __.firostRun(command, {
      stdout: false,
    });
    return stdout;
  },
  /**
   * Runs the test suite via yarn run test
   * @returns {boolean} True on success
   */
  async yarnRunTest() {
    await __.firostRun('yarn run test');
    return true;
  },
  /**
   * Runs linting via yarn run lint
   * @returns {boolean} True on success
   */
  async yarnRunLint() {
    await __.firostRun('yarn run lint');
    return true;
  },
  consoleInfo,
  firostRun,
};

export default {
  run,
};
