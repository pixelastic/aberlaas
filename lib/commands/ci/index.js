import ciInfo from 'ci-info';
import pMap from 'golgoth/pMap.js';
import run from 'firost/run.js';
import commandTest from '../test/index.js';
import commandLint from '../lint/index.js';
import consoleInfo from 'firost/consoleInfo.js';

export default {
  /**
   * Checks if currently running on a CI server
   * @returns {boolean} True if on a CI server
   **/
  isCI() {
    return ciInfo.isCI;
  },
  /**
   * Run CI scripts and fail the job if any fails
   * Runs lint and test by default, but can be changed with --no-test and
   * --no-lint
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success, throws on error
   **/
  async run(cliArgs = {}) {
    const args = {
      test: true,
      lint: true,
      ...cliArgs,
    };

    if (!this.isCI()) {
      this.__consoleInfo('Current system is not a CI, skipping');
      return true;
    }

    if (args.test) {
      await commandTest.run();
    }

    if (args.lint) {
      await commandLint.run();
    }

    return true;
  },
  __run: run,
  __consoleInfo: consoleInfo,
};
