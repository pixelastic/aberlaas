import { _ } from 'golgoth';
import { firostError } from 'firost';
import { getConfig, hostPackageRoot } from 'aberlaas-helper';
import { createVitest, registerConsoleShortcuts } from 'vitest/node';
import { slowPrefix } from '../configs/slow.js';
import viteConfig from '../configs/vite.js';

export let __;

/**
 * Test all files using Vitest
 * Usage:
 * $ aberlaas test                                # Test all files
 * $ aberlaas test ./path/to/__tests__/file.js    # Test specific files
 * $ aberlaas test ./path/to/file.js              # Test specific files
 * $ aberlaas test --related                      # Test all related files
 * $ aberlaas test --failFast                     # Stop early as soon as one test fails
 * $ aberlaas test --only-slow                    # Run only tests marked with .slow()
 * $ aberlaas test --flags                        # Flags passed to vitest
 * @param {object} cliArgs CLI Argument object, as created by minimist
 * @returns {boolean} true on success
 */
export async function run(cliArgs = {}) {
  const options = await __.vitestOptions(cliArgs);
  const isWatchMode = !!options.watch;
  const isRelatedMode = options.related?.length > 0;

  // If no files are passed, we assume we want to test the current project
  const packageRoot = await hostPackageRoot();
  let files = _.isEmpty(cliArgs._) ? [packageRoot] : cliArgs._;

  // If --related is passed, the list of files will already by in the .related
  // key, and need to be removed from the files
  if (isRelatedMode) files = [];

  // Vitest will change process.exitCode, so we save it to revert it later
  const initialExitCode = process.exitCode;

  const vitest = await createVitest('test', options);

  // Enable keyboard interaction in watch mode
  if (isWatchMode) {
    registerConsoleShortcuts(vitest);
  }

  try {
    await vitest.start(files);
  } catch (err) {
    // We can safely swallow the VITEST_FILES_NOT_FOUND error. It's ok to
    // continue if no files are found
    if (err.code != 'VITEST_FILES_NOT_FOUND') {
      throw err;
    }
  }

  const testsAreFailing = process.exitCode == 1;
  process.exitCode = initialExitCode;

  if (isWatchMode) {
    return;
  }

  // Stop vitest, it doesn't stop itself by default
  await vitest.close();

  if (testsAreFailing) {
    throw firostError('ABERLAAS_TEST_FAIL', 'Tests are failing');
  }

  return true;
}

__ = {
  /**
   * Transform all aberlaas test cli options into suitable vitest options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of options for vitest
   */
  async vitestOptions(cliArgs = {}) {
    // Options that have special meaning in aberlaas and shouldn't be passed
    // as-is to vitest
    const specialMeaningCliArgs = [
      '_',
      'config',
      'failFast',
      'related',
      'exclude',
      'only-slow',
    ];

    // Reading base options from the config file
    const config = await getConfig(
      cliArgs.config,
      'vite.config.js',
      viteConfig,
    );
    const optionsFromConfig = config.test;

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
    // --only-slow runs only tests marked with .slow()
    if (cliArgs['only-slow']) {
      optionsFromAberlaas.testNamePattern = _.escapeRegExp(slowPrefix);
    }
    // --related runs also related files
    // Note (2024-10-01): The related option is not documented, but should
    // contain the list of files.
    if (cliArgs.related) {
      optionsFromAberlaas.related = cliArgs._;
    }
    // --exclude arguments should be added to the existing list of exclude
    // patterns
    // TODO: Add test for that
    if (cliArgs.exclude) {
      optionsFromAberlaas.exclude = [
        ...optionsFromConfig.exclude,
        cliArgs.exclude,
      ];
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

export default {
  run,
};
