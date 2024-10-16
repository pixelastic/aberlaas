import ciInfo from 'ci-info';
import { firostError, run } from 'firost';
import commandTest from 'aberlaas-test';
import commandLint from 'aberlaas-lint';

export default {
  /**
   * Checks if currently running on a CI server
   * @returns {boolean} True if on a CI server
   */
  isCI() {
    return ciInfo.isCI;
  },
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

    if (args.test) {
      await this.__runTest();
    }

    if (args.lint) {
      await this.__runLint();
    }

    return true;
  },
  __runTest: commandTest.run.bind(commandTest),
  __runLint: commandLint.run.bind(commandLint),
  __run: run,
};
