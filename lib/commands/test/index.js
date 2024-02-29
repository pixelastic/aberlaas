import { createVitest, registerConsoleShortcuts } from 'vitest/node';
import helper from '../../helper.js';
import { firostError, firostImport } from 'firost';
import { _ } from 'golgoth';

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
    const files = _.isEmpty(cliArgs._) ? [helper.hostPath()] : cliArgs._;

    const vitest = await createVitest('test', options);

    // Enable keyboard interaction in watch mode
    if (options.watch) {
      registerConsoleShortcuts(vitest);
    }

    // Note: vitest sets process.exitCode to 1 if tests fail
    const initialExitCode = process.exitCode;
    await vitest.start(files);

    // Close vitest if not watching files
    if (!options.watch) {
      await vitest.close();
    }

    if (process.exitCode == 1) {
      process.exitCode = initialExitCode;
      throw firostError('ERROR_TEST', 'Error while testing files');
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
