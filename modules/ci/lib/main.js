import { consoleInfo, firostError, run } from 'firost';
import ciInfo from 'ci-info';
import commandTest from 'aberlaas-test';
import commandLint from 'aberlaas-lint';

export default {
  /**
   * Run CI scripts and fail the job if any fails
   * Runs lint and test by default, but can be changed with --no-test and
   * --no-lint
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success, throws on error
   */
  async run(cliArgs = {}) {
    const args = {
      test: true,
      lint: true,
      ...cliArgs,
    };

    if (!this.isCI()) {
      throw firostError(
        'ERROR_CI',
        'Current system is not a CI. Use CI=1 to force',
      );
    }

    await this.displayVersions();

    if (args.test) {
      await this.__runTest();
    }

    if (args.lint) {
      await this.__runLint();
    }

    return true;
  },
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
    const nodeVersion = await this.runCommand('node --version');
    const yarnVersion = await this.runCommand('yarn --version');
    this.__consoleInfo(`node ${nodeVersion}, yarn ${yarnVersion}`);
  },
  /**
   * Executes a command asynchronously and returns the stdout output
   * @param {string} command - The command to execute
   * @returns {string} The stdout output of the executed command
   */
  async runCommand(command) {
    const { stdout } = await this.__run(command, {
      stdout: false,
    });
    return stdout;
  },
  __consoleInfo: consoleInfo,
  __runTest: commandTest.run.bind(commandTest),
  __runLint: commandLint.run.bind(commandLint),
  __run: run,
};
