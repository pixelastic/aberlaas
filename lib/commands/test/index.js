import { createVitest, registerConsoleShortcuts } from 'vitest/node';
import { firostError, firostImport } from 'firost';
import { _ } from 'golgoth';
import helper from '../../helper.js';

export default {
  /**
   * Test all files using Vitest
   * Usage:
   * $ aberlaas test                                # Test all files
   * $ aberlaas test ./path/to/__tests__/file.js    # Test specific files
   * $ aberlaas test ./path/to/file.js              # Test specific files
   * $ aberlaas test --related                      # Test all related files
   * $ aberlaas test --failFast                     # Stop early as soon as one test fails
   * $ aberlaas test --flags                        # Flags passed to vitest
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} true on success
   **/
  async run(cliArgs = {}) {
    const options = await this.vitestOptions(cliArgs);
    const isWatchMode = !!options.watch;
    const files = _.isEmpty(cliArgs._) ? [helper.hostPath()] : cliArgs._;

    // Vitest will change process.exitCode, so we save it to revert it later
    const initialExitCode = process.exitCode;

    // Fails are expected, when tests are red
    // Errors are unexpected, when code doesn't even run
    let testsAreFailing = false;
    let testsAreErroring = false;
    let testErrorReason = null;

    const vitest = await createVitest('test', options);

    // Enable keyboard interaction in watch mode
    if (isWatchMode) {
      registerConsoleShortcuts(vitest);
    }

    try {
      await vitest.start(files);
    } catch (err) {
      // Error: Vitest is throwing an error
      testsAreErroring = true;
      testErrorReason = err;
    }
    // Fail: Tests are failing, process.exitCode is 1
    const exitCodeIsOne = process.exitCode == 1;
    testsAreFailing = exitCodeIsOne && !testsAreErroring;
    process.exitCode = initialExitCode;

    if (isWatchMode) {
      return;
    }

    // Stop vitest, it doesn't stop itself by default
    await vitest.close();

    if (testsAreFailing) {
      throw firostError('ERROR_TEST_FAIL', 'Tests are failing');
    }
    if (testsAreErroring) {
      const errorMessage = `Tests are failing:\n\t${testErrorReason}`;
      throw firostError('ERROR_TEST_ERROR', errorMessage);
    }

    return true;
  },

  /**
   * Transform all aberlaas test cli options into suitable vitest options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of options for vitest
   **/
  async vitestOptions(cliArgs = {}) {
    // Options that have special meaning in aberlaas and shouldn't be passed
    // as-is to vitest
    const specialMeaningCliArgs = ['_', 'config', 'failFast', 'related'];

    // Reading base options from the config file
    const configFile = await helper.configFile(
      cliArgs.config,
      'vite.config.js',
      'configs/vite.js',
    );
    const optionsFromConfig = (await firostImport(configFile)).test;

    // Enhancing options with custom CLI arguments
    const optionsFromAberlaas = {
      // We always allow fit/fdescribe, even in CI. Those errors will be caught
      // by the lint command instead
      allowOnly: true,
    };
    // --failFast stops early as soon as one test fails
    if (cliArgs.failFast) {
      optionsFromAberlaas.bail = 1;
    }
    // --related runs also related files
    // Note (2024-01-19): The related option is not documented, but should
    // contain the list of files
    if (cliArgs.related) {
      optionsFromAberlaas.related = cliArgs._;
    }

    // Passing other CLI options directly to vitest
    const optionsFromCli = _.omit(cliArgs, specialMeaningCliArgs);

    return {
      ...optionsFromConfig,
      ...optionsFromAberlaas,
      ...optionsFromCli,
    };
  },
};
