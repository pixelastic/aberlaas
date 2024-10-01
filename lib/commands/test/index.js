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
    const isRelatedMode = options.related.length > 0;
    const files = _.isEmpty(cliArgs._) ? [helper.hostPath()] : cliArgs._;

    // Vitest will change process.exitCode, so we save it to revert it later
    const initialExitCode = process.exitCode;

    const vitest = await createVitest('test', options);

    // Enable keyboard interaction in watch mode
    if (isWatchMode) {
      registerConsoleShortcuts(vitest);
    }

    // The actual list of files must be cleaned for options.related (set through
    // --related), to be enabled
    if (isRelatedMode) {
      await vitest.start();
    } else {
      await vitest.start(files);
    }

    const testsAreFailing = process.exitCode == 1;
    process.exitCode = initialExitCode;

    if (isWatchMode) {
      return;
    }

    // Stop vitest, it doesn't stop itself by default
    await vitest.close();

    if (testsAreFailing) {
      throw firostError('ERROR_TEST_FAIL', 'Tests are failing');
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
